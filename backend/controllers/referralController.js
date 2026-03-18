const Referral = require('../models/Referral');
const ReferralApplication = require('../models/ReferralApplication');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const axios = require('axios');
const {
    calculateFitScore,
    checkEligibility,
    generateResumeHash,
} = require('../services/referralScoring.service');
const { notifyUsersByRole } = require('../utils/notifications');


const referralUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowed =
            /pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document/;
        const extAllowed = /\.(pdf|doc|docx)$/i;
        if (allowed.test(file.mimetype) || extAllowed.test(file.originalname)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are supported'));
        }
    },
});


async function parseResumeText(file) {
    let text = '';
    if (
        file.mimetype === 'application/pdf' ||
        file.originalname.toLowerCase().endsWith('.pdf')
    ) {
        const pdfParse = require('pdf-parse');
        const result = await pdfParse(file.buffer);
        text = result.text;
    } else {
        text = file.buffer.toString('utf-8');
        text = text.replace(/<[^>]+>/g, ' ').replace(/[^\x20-\x7E\n]/g, ' ');
    }
    return text;
}

async function uploadResumeToCloudinary(fileBuffer, originalname) {
    const safeOriginalName = (originalname || 'resume.pdf')
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '');
    const safeBaseName = safeOriginalName.replace(/\.[^.]+$/, '') || 'resume';

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'alumniconnect/referral-resumes',
                resource_type: 'raw',
                use_filename: true,
                unique_filename: true,
                filename_override: safeBaseName,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });
}

function normalizeDeadline(deadlineInput) {
    if (!deadlineInput) return null;
    const raw = String(deadlineInput).trim();


    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return new Date(`${raw}T23:59:59.999`);
    }

    return new Date(raw);
}

function isValidGithubUrl(url = '') {
    try {
        const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const parsed = new URL(normalized);
        if (!/^(www\.)?github\.com$/i.test(parsed.hostname)) return false;
        const parts = (parsed.pathname || '').split('/').filter(Boolean);
        return parts.length >= 1;
    } catch {
        return false;
    }
}

function extractGithubUsername(url = '') {
    try {
        const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const parsed = new URL(normalized);
        if (!/^(www\.)?github\.com$/i.test(parsed.hostname)) return '';
        const parts = (parsed.pathname || '').split('/').filter(Boolean);
        return (parts[0] || '').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    } catch {
        return '';
    }
}


const createReferral = async (req, res) => {
    try {
        const {
            company,
            jobTitle,
            jobDescription,
            jobLink,
            requiredSkills,
            eligibleBranches,
            minCGPA,
            eligibleYears,
            maxApplications,
            deadline,
        } = req.body;

        if (!company || !jobTitle || !jobDescription || !deadline) {
            return res.status(400).json({
                message: 'Company, job title, description, and deadline are required',
            });
        }

        const parsedDeadline = normalizeDeadline(deadline);
        if (!parsedDeadline || Number.isNaN(parsedDeadline.getTime())) {
            return res.status(400).json({ message: 'Please provide a valid deadline date' });
        }

        if (parsedDeadline < new Date()) {
            return res.status(400).json({ message: 'Deadline cannot be in the past' });
        }

        const referral = await Referral.create({
            postedBy: req.user._id,
            company,
            jobTitle,
            jobDescription,
            jobLink: jobLink || '',
            requiredSkills: Array.isArray(requiredSkills)
                ? requiredSkills
                : (requiredSkills || '').split(',').map((s) => s.trim()).filter(Boolean),
            eligibleBranches: Array.isArray(eligibleBranches)
                ? eligibleBranches
                : (eligibleBranches || '').split(',').map((s) => s.trim()).filter(Boolean),
            minCGPA: parseFloat(minCGPA) || 0,
            eligibleYears: Array.isArray(eligibleYears)
                ? eligibleYears.map(Number)
                : (eligibleYears || '').split(',').map((y) => parseInt(y.trim())).filter((y) => !isNaN(y)),
            maxApplications: parseInt(maxApplications) || 50,
            deadline: parsedDeadline,
        });

        notifyUsersByRole('student', {
            sender: req.user._id,
            type: 'system',
            title: 'New Referral Opportunity',
            message: `${req.user.name} posted ${jobTitle} at ${company}`,
            link: '/referrals',
            relatedId: referral._id,
            excludeUserId: req.user._id,
        }).catch((error) => {
            console.error('Referral notification error:', error);
        });

        res.status(201).json({
            success: true,
            message: 'Referral posted successfully',
            referral,
        });
    } catch (error) {
        console.error('Create referral error:', error);
        res.status(500).json({ message: 'Failed to create referral' });
    }
};


const getAllReferrals = async (req, res) => {
    try {
        const {
            company,
            skills,
            branch,
            minCGPA,
            page = 1,
            limit = 20,
        } = req.query;

        const filter = {
            status: 'open',
            deadline: { $gte: new Date() },
        };

        if (company && company.trim()) {
            filter.company = { $regex: company.trim(), $options: 'i' };
        }

        if (skills && skills.trim()) {
            const skillList = skills
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            if (skillList.length > 0) {
                filter.requiredSkills = {
                    $in: skillList.map((s) => new RegExp(s, 'i')),
                };
            }
        }

        if (branch && branch.trim()) {
            filter.$or = [
                { eligibleBranches: { $size: 0 } }, // no restriction
                { eligibleBranches: { $regex: branch.trim(), $options: 'i' } },
            ];
        }

        if (minCGPA) {
            filter.$or = [
                ...(filter.$or || []),
                { minCGPA: { $lte: parseFloat(minCGPA) } },
                { minCGPA: 0 },
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Referral.countDocuments(filter);
        const referrals = await Referral.find(filter)
            .populate('postedBy', 'name email company jobTitle avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            referrals,
        });
    } catch (error) {
        console.error('Get referrals error:', error);
        res.status(500).json({ message: 'Failed to fetch referrals' });
    }
};


const getReferralById = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id).populate(
            'postedBy',
            'name email company jobTitle avatar graduationYear'
        );

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }


        let existingApplication = null;
        if (req.user.role === 'student') {
            existingApplication = await ReferralApplication.findOne({
                referral: referral._id,
                student: req.user._id,
            }).select('status totalScore createdAt');
        }

        res.json({
            success: true,
            referral,
            existingApplication,
        });
    } catch (error) {
        console.error('Get referral error:', error);
        res.status(500).json({ message: 'Failed to fetch referral' });
    }
};


const getMyListings = async (req, res) => {
    try {
        const referrals = await Referral.find({ postedBy: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, referrals });
    } catch (error) {
        console.error('Get my listings error:', error);
        res.status(500).json({ message: 'Failed to fetch your listings' });
    }
};


const updateReferral = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id);

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        if (referral.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this referral' });
        }

        const allowedFields = [
            'jobTitle', 'jobDescription', 'jobLink', 'requiredSkills',
            'eligibleBranches', 'minCGPA', 'eligibleYears', 'maxApplications',
            'deadline', 'status',
        ];

        if (req.body.deadline !== undefined) {
            const parsedDeadline = normalizeDeadline(req.body.deadline);
            if (!parsedDeadline || Number.isNaN(parsedDeadline.getTime())) {
                return res.status(400).json({ message: 'Please provide a valid deadline date' });
            }
            if (parsedDeadline < new Date()) {
                return res.status(400).json({ message: 'Deadline cannot be in the past' });
            }
            req.body.deadline = parsedDeadline;
        }

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                if (field === 'requiredSkills' || field === 'eligibleBranches') {
                    referral[field] = Array.isArray(req.body[field])
                        ? req.body[field]
                        : req.body[field].split(',').map((s) => s.trim()).filter(Boolean);
                } else if (field === 'eligibleYears') {
                    referral[field] = Array.isArray(req.body[field])
                        ? req.body[field].map(Number)
                        : req.body[field].split(',').map((y) => parseInt(y.trim())).filter((y) => !isNaN(y));
                } else if (field === 'minCGPA') {
                    referral[field] = parseFloat(req.body[field]) || 0;
                } else if (field === 'deadline') {
                    referral[field] = req.body[field];
                } else {
                    referral[field] = req.body[field];
                }
            }
        });

        await referral.save();

        res.json({ success: true, message: 'Referral updated', referral });
    } catch (error) {
        console.error('Update referral error:', error);
        res.status(500).json({ message: 'Failed to update referral' });
    }
};


const deleteReferral = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id);

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        if (referral.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this referral' });
        }

        const applications = await ReferralApplication.find({
            referral: req.params.id,
        }).select('resumePublicId');

        if (applications.length > 0) {
            const cleanupTasks = applications
                .map((application) => application.resumePublicId)
                .filter(Boolean)
                .map((publicId) =>
                    cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
                );

            await Promise.allSettled(cleanupTasks);

            await ReferralApplication.deleteMany({ referral: req.params.id });
        }

        await Referral.findByIdAndDelete(req.params.id);
        res.json({
            success: true,
            action: 'deleted',
            message: 'Referral and related applications deleted',
            referralId: req.params.id,
            deletedApplications: applications.length,
        });
    } catch (error) {
        console.error('Delete referral error:', error);
        res.status(500).json({ message: 'Failed to delete referral' });
    }
};


const applyToReferral = async (req, res) => {
    try {
        const referralId = req.params.id;
        const studentId = req.user._id;


        const [referral, student] = await Promise.all([
            Referral.findById(referralId),
            User.findById(studentId),
        ]);

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }


        const eligibility = checkEligibility(student, referral);
        if (!eligibility.eligible) {
            return res.status(403).json({
                success: false,
                isEligible: false,
                message: eligibility.reason,
            });
        }


        const existingApp = await ReferralApplication.findOne({
            referral: referralId,
            student: studentId,
        });
        if (existingApp) {
            return res.status(409).json({
                message: 'You have already applied to this referral',
            });
        }


        const spamCheck = await ReferralApplication.findOne({
            student: studentId,
            status: { $in: ['pending', 'referred'] },
        }).populate({
            path: 'referral',
            select: 'company jobTitle',
        });

        if (spamCheck && spamCheck.referral) {
            const sameRole =
                spamCheck.referral.company?.toLowerCase() ===
                    referral.company?.toLowerCase() &&
                spamCheck.referral.jobTitle?.toLowerCase() ===
                    referral.jobTitle?.toLowerCase();
            if (sameRole) {
                return res.status(429).json({
                    message: `You already have a pending/referred application for ${referral.jobTitle} at ${referral.company}. One application per role.`,
                });
            }
        }


        if (!req.file) {
            return res.status(400).json({
                message: 'Please upload your resume (PDF, DOC, or DOCX)',
            });
        }


        const {
            coverNote,
            projectLinks: projectLinksRaw,
            skillSelfRatings: skillRatingsRaw,
            cgpaConfirmed,
        } = req.body;


        if (referral.minCGPA > 0 && cgpaConfirmed !== 'true' && cgpaConfirmed !== true) {
            return res.status(400).json({
                message: 'You must confirm your CGPA accuracy to apply',
            });
        }

        let projectLinks = [];
        try {
            projectLinks = projectLinksRaw ? JSON.parse(projectLinksRaw) : [];
        } catch {
            projectLinks = [];
        }

        if (!Array.isArray(projectLinks)) {
            projectLinks = [];
        }

        const invalidGithubLink = projectLinks.find(
            (link) => link?.url && !isValidGithubUrl(link.url)
        );
        if (invalidGithubLink) {
            return res.status(400).json({
                message: 'Only valid GitHub project links are allowed',
            });
        }

        projectLinks = projectLinks.map((link) => ({
            title: String(link?.title || '').trim(),
            url: String(link?.url || '').trim(),
            type: 'github',
        })).filter((link) => link.title && link.url);

        const accountGithubUsername = extractGithubUsername(student?.github || '');
        if (accountGithubUsername && projectLinks.length > 0) {
            const mismatched = projectLinks.find((link) => {
                const linkGithubUsername = extractGithubUsername(link.url);
                return linkGithubUsername && linkGithubUsername !== accountGithubUsername;
            });

            if (mismatched) {
                return res.status(400).json({
                    message: 'Project GitHub username must match your account GitHub username',
                });
            }
        }

        let skillSelfRatings = [];
        try {
            skillSelfRatings = skillRatingsRaw ? JSON.parse(skillRatingsRaw) : [];
        } catch {
            skillSelfRatings = [];
        }


        let resumeText = '';
        try {
            resumeText = await parseResumeText(req.file);
        } catch (parseErr) {
            console.error('Resume parse error:', parseErr);
            return res.status(422).json({
                message: 'Could not read your resume. Please upload a text-based PDF.',
            });
        }

        if (!resumeText || resumeText.trim().length < 50) {
            return res.status(422).json({
                message: 'Could not extract readable text from resume. Please upload a text-based PDF (not scanned image).',
            });
        }


        let uploadResult;
        try {
            uploadResult = await uploadResumeToCloudinary(
                req.file.buffer,
                req.file.originalname
            );
        } catch (uploadErr) {
            console.error('Resume upload error:', uploadErr);
            return res.status(500).json({
                message: 'Failed to upload resume. Please try again.',
            });
        }


        const resumeHash = generateResumeHash(resumeText);


        const existingHashes = await ReferralApplication.find({
            referral: referralId,
            resumeHash: { $ne: '' },
        }).distinct('resumeHash');


        const scoreResult = calculateFitScore({
            student,
            referral,
            resumeText,
            projectLinks,
            existingHashes,
            resumeHash,
        });


        const application = await ReferralApplication.create({
            referral: referralId,
            student: studentId,
            resumeUrl: uploadResult.secure_url,
            resumePublicId: uploadResult.public_id,
            resumeText,
            resumeHash,
            coverNote: (coverNote || '').slice(0, 500),
            projectLinks,
            skillSelfRatings,
            cgpaConfirmed: cgpaConfirmed === 'true' || cgpaConfirmed === true,
            fitScore: scoreResult.fitScore,
            totalScore: scoreResult.totalScore,
            fraudFlags: scoreResult.fraudFlags,
            isEligible: true,
        });


        await Referral.findByIdAndUpdate(referralId, {
            $inc: { applicationsCount: 1 },
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            application: {
                _id: application._id,
                totalScore: application.totalScore,
                fitScore: application.fitScore,
                fraudFlags: application.fraudFlags,
                status: application.status,
                createdAt: application.createdAt,
            },
        });
    } catch (error) {

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'You have already applied to this referral',
            });
        }
        console.error('Apply to referral error:', error);
        res.status(500).json({ message: 'Failed to submit application' });
    }
};


const getApplications = async (req, res) => {
    try {
        const referral = await Referral.findById(req.params.id);

        if (!referral) {
            return res.status(404).json({ message: 'Referral not found' });
        }

        if (referral.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: 'Not authorized to view these applications',
            });
        }

        const { status, sortBy = 'totalScore', page = 1, limit = 20 } = req.query;

        const filter = { referral: req.params.id };
        if (status) filter.status = status;

        const sortOptions = {};
        if (sortBy === 'totalScore') sortOptions.totalScore = -1;
        else if (sortBy === 'createdAt') sortOptions.createdAt = -1;
        else sortOptions.totalScore = -1;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await ReferralApplication.countDocuments(filter);

        const applications = await ReferralApplication.find(filter)
            .populate(
                'student',
                'name email avatar skills branch graduationYear cgpa github linkedin'
            )
            .select('-resumeText') // Don't send raw text in list view
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        res.json({
            success: true,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            applications,
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({ message: 'Failed to fetch applications' });
    }
};


const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['reviewed', 'referred', 'rejected'].includes(status)) {
            return res.status(400).json({
                message: 'Invalid status. Use: reviewed, referred, or rejected',
            });
        }

        const application = await ReferralApplication.findById(
            req.params.appId
        ).populate('referral', 'postedBy');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }


        if (
            application.referral.postedBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: 'Not authorized to update this application',
            });
        }

        application.status = status;
        application.reviewedAt = new Date();
        await application.save();


        if (status === 'referred') {
            const referredCount = await ReferralApplication.countDocuments({
                referral: application.referral._id,
                status: 'referred',
            });

            if (referredCount >= application.referral.maxApplications) {
                await Referral.findByIdAndUpdate(application.referral._id, {
                    status: 'filled',
                });
            }
        }

        res.json({
            success: true,
            message: `Application marked as ${status}`,
            application: {
                _id: application._id,
                status: application.status,
                reviewedAt: application.reviewedAt,
            },
        });
    } catch (error) {
        console.error('Update application status error:', error);
        res.status(500).json({ message: 'Failed to update application' });
    }
};


const getMyApplications = async (req, res) => {
    try {
        const applications = await ReferralApplication.find({
            student: req.user._id,
        })
            .populate({
                path: 'referral',
                select: 'company jobTitle status deadline postedBy',
                populate: {
                    path: 'postedBy',
                    select: 'name avatar',
                },
            })
            .select('-resumeText')
            .sort({ createdAt: -1 });

        res.json({ success: true, applications });
    } catch (error) {
        console.error('Get my applications error:', error);
        res.status(500).json({ message: 'Failed to fetch your applications' });
    }
};


const downloadApplicationResume = async (req, res) => {
    try {
        const application = await ReferralApplication.findById(req.params.appId)
            .populate('referral', 'postedBy')
            .populate('student', 'name');

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        const isReferralOwner =
            application.referral?.postedBy?.toString() === req.user._id.toString();
        const isApplicant =
            application.student?._id?.toString() === req.user._id.toString();

        if (!isReferralOwner && !isApplicant) {
            return res.status(403).json({ message: 'Not authorized to download this resume' });
        }

        if (!application.resumeUrl) {
            return res.status(404).json({ message: 'Resume file not available' });
        }

        const upstream = await axios.get(application.resumeUrl, {
            responseType: 'stream',
            timeout: 20000,
        });

        const parsed = new URL(application.resumeUrl);
        const sourceName = decodeURIComponent(parsed.pathname.split('/').pop() || 'resume.pdf');
        const cleanedName = sourceName.replace(/^\d+-/, '') || 'resume.pdf';
        const safeName = cleanedName.replace(/[^a-zA-Z0-9._-]/g, '_');

        res.setHeader('Content-Type', upstream.headers['content-type'] || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
        res.setHeader('Cache-Control', 'no-store');

        upstream.data.pipe(res);
    } catch (error) {
        console.error('Download resume error:', error?.message || error);
        res.status(500).json({ message: 'Failed to download resume' });
    }
};

module.exports = {
    referralUpload,
    createReferral,
    getAllReferrals,
    getReferralById,
    getMyListings,
    updateReferral,
    deleteReferral,
    applyToReferral,
    getApplications,
    updateApplicationStatus,
    getMyApplications,
    downloadApplicationResume,
};
