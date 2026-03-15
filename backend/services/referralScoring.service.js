/* ============================================================
   REFERRAL FIT SCORING ENGINE
   ─────────────────────────────────────────────────────────────
   Weights:
     Required skills match        30%
     Projects / experience depth  25%
     Education match              15%
     Resume completeness          10%
     CGPA / eligibility           10%
     Fraud risk penalty          -10%
   ============================================================ */

const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function countRegex(text, regex) {
    const g = new RegExp(
        regex.source,
        (regex.flags.includes('g') ? '' : 'g') + regex.flags.replace('g', '')
    );
    const m = text.match(g);
    return m ? m.length : 0;
}

function parseGithubUsername(url = '') {
    try {
        const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
        const parsed = new URL(normalized);
        if (!/^(www\.)?github\.com$/i.test(parsed.hostname)) return '';
        const segment = (parsed.pathname || '')
            .split('/')
            .filter(Boolean)[0];
        return (segment || '').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
    } catch {
        return '';
    }
}

function extractGithubUsernamesFromText(text = '') {
    const usernames = new Set();
    const regex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-]+)/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const username = (match[1] || '').toLowerCase();
        if (username) usernames.add(username);
    }
    return Array.from(usernames);
}

/** Rough section splitter – returns text chunks by heading */
function splitSections(text) {
    const lines = text.split(/\n/);
    const sections = {};
    let current = '__top__';

    const headingRe =
        /^(experience|work\s*history|education|skills?|projects?|certifications?|summary|objective|contact|awards?|achievements?)/i;

    lines.forEach((line) => {
        const trimmed = line.trim();
        if (headingRe.test(trimmed)) {
            current = trimmed.toLowerCase().replace(/[^a-z]/g, '');
            sections[current] = '';
        } else {
            sections[current] = (sections[current] || '') + '\n' + line;
        }
    });

    return sections;
}

/** Extract bullet points (same logic as ATS controller) */
function extractBullets(text) {
    return text
        .split(/\n/)
        .map((l) => l.replace(/^[\s•\-–—▪▸►◦‣⁃·*]+/, '').trim())
        .filter((l) => l.length > 15);
}

// ═══════════════════════════════════════════════════════════════
// SECTION DETECTION (reused from ATS patterns)
// ═══════════════════════════════════════════════════════════════

const SECTION_PATTERNS = {
    contact:
        /\b(phone|email|linkedin|github|portfolio|website|@|\.com)\b/i,
    summary:
        /\b(summary|objective|profile|about\s+me|professional\s+summary|overview|career\s+summary)\b/i,
    experience:
        /\b(experience|work\s+history|employment|professional\s+experience|career\s+history|positions?\s+held)\b/i,
    education:
        /\b(education|academic|degree|bachelor|master|ph\.?d|university|college|school|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a)\b/i,
    skills:
        /\b(skills?|technologies|tech\s+stack|competencies|expertise|proficiencies|tools|languages\s*:)\b/i,
    projects:
        /\b(projects?|portfolio|personal\s+projects?|side\s+projects?|notable\s+work|key\s+projects?)\b/i,
    certifications:
        /\b(certifications?|certificates?|credentials?|licensed?|accreditation|certified)\b/i,
};

function detectSections(text) {
    const found = {};
    for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
        found[section] = pattern.test(text);
    }
    return found;
}

// ═══════════════════════════════════════════════════════════════
// 1. SKILLS MATCH (30%)
// ═══════════════════════════════════════════════════════════════

function scoreSkillsMatch(resumeText, profileSkills, requiredSkills) {
    if (!requiredSkills || requiredSkills.length === 0) {
        return { score: 100, details: 'No specific skills required' };
    }

    const resumeLower = resumeText.toLowerCase();
    const sections = splitSections(resumeText);

    // Combine experience + projects sections for "contextual" check
    const contextSections = ['experience', 'workhistory', 'projects', 'project'].reduce(
        (acc, key) => {
            const match = Object.keys(sections).find((k) => k.includes(key));
            return match ? acc + '\n' + sections[match] : acc;
        },
        ''
    ).toLowerCase();

    // Skills-only section
    const skillsSection = Object.keys(sections)
        .filter((k) => k.includes('skill') || k.includes('tech') || k.includes('competenc'))
        .map((k) => sections[k])
        .join('\n')
        .toLowerCase();

    const profileSkillsLower = new Set(
        (profileSkills || []).map((s) => s.toLowerCase())
    );

    let totalWeight = 0;
    let earnedWeight = 0;
    const matchDetails = [];

    requiredSkills.forEach((skill) => {
        const skillLower = skill.toLowerCase();
        const skillRe = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        totalWeight += 1;

        const inContext = skillRe.test(contextSections);
        const inSkillsList = skillRe.test(skillsSection);
        const inProfile = profileSkillsLower.has(skillLower);
        const inResumeAnywhere = skillRe.test(resumeLower);

        if (inContext && inProfile) {
            // Strong signal: skill appears in project/work context AND profile
            earnedWeight += 1.0;
            matchDetails.push({ skill, signal: 'strong', weight: 1.0 });
        } else if (inContext) {
            // Good signal: in context but not in profile
            earnedWeight += 0.85;
            matchDetails.push({ skill, signal: 'good', weight: 0.85 });
        } else if (inSkillsList && inProfile) {
            // Medium signal: in skills list and profile but no project evidence
            earnedWeight += 0.5;
            matchDetails.push({ skill, signal: 'medium', weight: 0.5 });
        } else if (inResumeAnywhere || inProfile) {
            // Weak signal: mentioned somewhere but no context
            earnedWeight += 0.25;
            matchDetails.push({ skill, signal: 'weak', weight: 0.25 });
        } else {
            matchDetails.push({ skill, signal: 'missing', weight: 0 });
        }
    });

    const score = totalWeight > 0
        ? Math.round((earnedWeight / totalWeight) * 100)
        : 100;

    return { score: Math.min(100, score), matchDetails };
}

// ═══════════════════════════════════════════════════════════════
// 2. PROJECTS / EXPERIENCE DEPTH (25%)
// ═══════════════════════════════════════════════════════════════

function scoreProjectDepth(resumeText, projectLinks) {
    let score = 0;
    const details = { signals: [], missing: [] };

    const sections = splitSections(resumeText);
    const bullets = extractBullets(resumeText);

    // --- Experience word count & quality ---
    const expSection = Object.keys(sections)
        .filter((k) => k.includes('experience') || k.includes('work'))
        .map((k) => sections[k])
        .join('\n');
    const expWordCount = expSection.split(/\s+/).filter(Boolean).length;

    if (expWordCount >= 200) score += 20;
    else if (expWordCount >= 100) score += 14;
    else if (expWordCount >= 50) score += 8;
    else score += 3;

    // --- Projects section ---
    const projSection = Object.keys(sections)
        .filter((k) => k.includes('project'))
        .map((k) => sections[k])
        .join('\n');
    const projWordCount = projSection.split(/\s+/).filter(Boolean).length;

    if (projWordCount >= 150) score += 15;
    else if (projWordCount >= 80) score += 10;
    else if (projWordCount >= 30) score += 5;

    // --- Measurable outcomes (numbers/percentages in bullets) ---
    const quantifiedBulletRe =
        /\d+[\s,]*(%|percent|users?|customers?|reduction|increase|improvement|growth|requests?|transactions?|hours?|x\s|x$|\$|€|£)/i;
    const quantifiedCount = bullets.filter((b) => quantifiedBulletRe.test(b)).length;
    const quantifiedRatio = bullets.length > 0 ? quantifiedCount / bullets.length : 0;

    if (quantifiedRatio >= 0.4) score += 20;
    else if (quantifiedRatio >= 0.2) score += 14;
    else if (quantifiedCount >= 2) score += 8;
    else if (quantifiedCount >= 1) score += 4;

    if (quantifiedCount > 0) details.signals.push(`${quantifiedCount} quantified outcomes`);

    // --- Verifiable project links ---
    const links = projectLinks || [];
    const githubLinks = links.filter((l) => l.type === 'github');
    const deployedLinks = links.filter((l) => l.type === 'deployed');

    if (githubLinks.length > 0) {
        score += 15;
        details.signals.push(`${githubLinks.length} GitHub link(s)`);
    }
    if (deployedLinks.length > 0) {
        score += 10;
        details.signals.push(`${deployedLinks.length} deployed project(s)`);
    }

    // No links at all → partial credit penalty
    if (links.length === 0) {
        score = Math.round(score * 0.7); // 30% penalty for no verifiable links
        details.missing.push('No project links provided — partial credit only');
    }

    // --- Tech stack diversity ---
    const techKeywords =
        /\b(react|angular|vue|node|express|django|flask|spring|aws|gcp|azure|docker|kubernetes|mongodb|postgres|mysql|redis|graphql|rest\s*api|typescript|python|java|go|rust|swift|kotlin)\b/gi;
    const techCount = new Set(
        (resumeText.match(techKeywords) || []).map((t) => t.toLowerCase())
    ).size;

    if (techCount >= 8) score += 10;
    else if (techCount >= 5) score += 7;
    else if (techCount >= 3) score += 4;

    if (techCount > 0) details.signals.push(`${techCount} technologies mentioned`);

    score = Math.min(100, Math.max(0, score));
    return { score, ...details };
}

// ═══════════════════════════════════════════════════════════════
// 3. EDUCATION MATCH (15%)
// ═══════════════════════════════════════════════════════════════

function scoreEducationMatch(student, referral) {
    let score = 0;

    // Branch match (60% of education score)
    const eligibleBranches = (referral.eligibleBranches || []).map((b) =>
        b.toLowerCase().trim()
    );
    const studentBranch = (student.branch || '').toLowerCase().trim();

    if (eligibleBranches.length === 0) {
        // No branch restriction — full marks
        score += 60;
    } else if (studentBranch && eligibleBranches.includes(studentBranch)) {
        score += 60;
    } else if (studentBranch) {
        // Check partial/related branch match
        const related = eligibleBranches.some(
            (b) => studentBranch.includes(b) || b.includes(studentBranch)
        );
        if (related) score += 30;
        // else 0 — wrong branch
    }

    // Year match (40% of education score)
    const eligibleYears = referral.eligibleYears || [];
    const studentYear = student.graduationYear;

    if (eligibleYears.length === 0) {
        score += 40;
    } else if (studentYear && eligibleYears.includes(studentYear)) {
        score += 40;
    }
    // else 0 — wrong year

    return { score: Math.min(100, score) };
}

// ═══════════════════════════════════════════════════════════════
// 4. RESUME COMPLETENESS (10%)
// ═══════════════════════════════════════════════════════════════

function scoreResumeCompleteness(resumeText) {
    let score = 0;
    const details = { missing: [] };

    const sections = detectSections(resumeText);
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
    const bullets = extractBullets(resumeText);

    // Section coverage (0–40 points)
    const criticalSections = ['experience', 'education', 'skills'];
    const foundCritical = criticalSections.filter((s) => sections[s]).length;

    score += foundCritical * 13; // max 39

    if (!sections.experience) details.missing.push('Missing experience section');
    if (!sections.education) details.missing.push('Missing education section');
    if (!sections.skills) details.missing.push('Missing skills section');

    // Optional sections bonus
    if (sections.projects) score += 8;
    if (sections.summary) score += 5;
    if (sections.certifications) score += 5;
    if (sections.contact) score += 3;

    // Word count (0–20 points)
    if (wordCount >= 300 && wordCount <= 900) score += 20;
    else if (wordCount >= 200) score += 12;
    else if (wordCount >= 100) score += 6;
    else {
        score += 2;
        details.missing.push(`Resume too short (${wordCount} words)`);
    }

    // Bullet quality (0–20 points)
    if (bullets.length >= 8) score += 20;
    else if (bullets.length >= 5) score += 14;
    else if (bullets.length >= 3) score += 8;
    else {
        score += 3;
        details.missing.push('Too few descriptive bullet points');
    }

    // Vague/generic language penalty
    const vaguePatterns = [
        /responsible for/gi,
        /duties included/gi,
        /was tasked with/gi,
        /helped to/gi,
        /assisted in/gi,
        /hardworking/gi,
        /team player/gi,
        /detail[- ]oriented/gi,
        /self[- ]motivated/gi,
        /fast learner/gi,
    ];
    let vagueCount = 0;
    vaguePatterns.forEach((p) => {
        vagueCount += countRegex(resumeText, p);
    });

    if (vagueCount >= 5) {
        score -= 15;
        details.missing.push(`${vagueCount} vague/generic phrases detected`);
    } else if (vagueCount >= 3) {
        score -= 8;
        details.missing.push(`${vagueCount} vague phrases detected`);
    }

    score = Math.min(100, Math.max(0, score));
    return { score, ...details };
}

// ═══════════════════════════════════════════════════════════════
// 5. CGPA / ELIGIBILITY SCORE (10%)
// ═══════════════════════════════════════════════════════════════

function scoreCGPA(studentCGPA, minCGPA) {
    if (minCGPA <= 0) {
        // No CGPA requirement
        return { score: 100 };
    }

    if (studentCGPA === null || studentCGPA === undefined) {
        return { score: 0, note: 'CGPA not set in profile' };
    }

    if (studentCGPA < minCGPA) {
        return { score: 0, note: `CGPA ${studentCGPA} below minimum ${minCGPA}` };
    }

    // Graduated scaling: exactly at threshold = 60, well above = 100
    const buffer = studentCGPA - minCGPA;
    if (buffer >= 2) return { score: 100 };
    if (buffer >= 1) return { score: 85 };
    if (buffer >= 0.5) return { score: 70 };
    return { score: 60 };
}

// ═══════════════════════════════════════════════════════════════
// 6. FRAUD RISK DETECTION (-10%)
// ═══════════════════════════════════════════════════════════════

function detectFraud({
    resumeText,
    profileSkills,
    requiredSkills,
    resumeHash,
    existingHashes,
    student,
    projectLinks,
}) {
    const flags = [];
    let penalty = 0;

    // --- 1. Skills claimed without supporting context ---
    const sections = splitSections(resumeText);
    const contextText = Object.keys(sections)
        .filter(
            (k) =>
                k.includes('experience') ||
                k.includes('work') ||
                k.includes('project')
        )
        .map((k) => sections[k])
        .join('\n')
        .toLowerCase();

    const claimedSkills = (profileSkills || []).filter((s) =>
        (requiredSkills || []).some(
            (rs) => rs.toLowerCase() === s.toLowerCase()
        )
    );

    let unsupportedCount = 0;
    claimedSkills.forEach((skill) => {
        const skillRe = new RegExp(
            `\\b${skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
            'i'
        );
        if (!skillRe.test(contextText)) {
            unsupportedCount++;
        }
    });

    if (unsupportedCount >= 3) {
        flags.push(
            `${unsupportedCount} claimed skills have no supporting project/experience context`
        );
        penalty += 40;
    } else if (unsupportedCount >= 1) {
        flags.push(
            `${unsupportedCount} claimed skill(s) lack project/experience evidence`
        );
        penalty += unsupportedCount * 10;
    }

    // --- 2. Generic / templated language (copy-paste JD) ---
    const genericPatterns = [
        /responsible for managing/gi,
        /duties included/gi,
        /responsible for all aspects/gi,
        /looking for a challenging/gi,
        /seeking a position/gi,
        /results[- ]driven professional/gi,
        /proven track record/gi,
        /strong communication skills/gi,
        /excellent interpersonal/gi,
        /ability to work in a fast[- ]paced/gi,
        /dynamic environment/gi,
    ];

    let genericCount = 0;
    genericPatterns.forEach((p) => {
        genericCount += countRegex(resumeText, p);
    });

    if (genericCount >= 5) {
        flags.push(
            `${genericCount} generic/templated phrases — possible copy-paste from job description`
        );
        penalty += 35;
    } else if (genericCount >= 3) {
        flags.push(`${genericCount} generic phrases detected`);
        penalty += 20;
    } else if (genericCount >= 1) {
        penalty += 5;
    }

    // --- 3. Resume hash deduplication ---
    if (resumeHash && existingHashes && existingHashes.length > 0) {
        const duplicates = existingHashes.filter((h) => h === resumeHash);
        if (duplicates.length > 0) {
            flags.push(
                'Resume is near-identical to another submitted resume — possible duplication'
            );
            penalty += 50;
        }
    }

    // --- 4. Extremely short resume ---
    const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
    if (wordCount < 80) {
        flags.push('Extremely short resume — insufficient content for evaluation');
        penalty += 20;
    }

    // --- 5. Repetitive content ---
    const sentences = resumeText
        .split(/[.!?\n]/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 20);
    const uniqueSentences = new Set(sentences);
    if (sentences.length > 5 && uniqueSentences.size < sentences.length * 0.7) {
        flags.push('High content repetition detected');
        penalty += 15;
    }

    // --- 6. Account identity vs resume identity ---
    const resumeLower = (resumeText || '').toLowerCase();
    const resumeHeader = (resumeText || '')
        .split(/\n/)
        .slice(0, 25)
        .join(' ')
        .toLowerCase();

    const fullName = (student?.name || '').trim().toLowerCase();
    const nameTokens = fullName
        .split(/\s+/)
        .map((token) => token.replace(/[^a-z]/g, ''))
        .filter((token) => token.length >= 3);

    if (nameTokens.length > 0) {
        const matchedNameTokens = nameTokens.filter((token) =>
            resumeHeader.includes(token)
        ).length;
        if (matchedNameTokens === 0) {
            flags.push('Resume header does not appear to match account name');
            penalty += 20;
        }
    }

    const accountEmail = (student?.email || '').trim().toLowerCase();
    if (accountEmail && !resumeLower.includes(accountEmail)) {
        flags.push('Account email not found in resume contact details');
        penalty += 10;
    }

    // --- 7. GitHub username consistency (account/profile/resume/project links) ---
    const projectGithubUsernames = (projectLinks || [])
        .map((link) => parseGithubUsername(link?.url || ''))
        .filter(Boolean);

    const resumeGithubUsernames = extractGithubUsernamesFromText(resumeText);
    const profileGithubUsername = parseGithubUsername(student?.github || '');

    if ((projectLinks || []).length > 0 && projectGithubUsernames.length === 0) {
        flags.push('Project links provided without valid GitHub profile/repo URLs');
        penalty += 20;
    }

    if (profileGithubUsername) {
        const mismatchedProjectLinks = projectGithubUsernames.filter(
            (username) => username !== profileGithubUsername
        ).length;
        if (mismatchedProjectLinks > 0) {
            flags.push(
                `${mismatchedProjectLinks} project link(s) use a GitHub username different from your account GitHub username`
            );
            penalty += Math.min(30, mismatchedProjectLinks * 15);
        }

        const mismatchedResumeGithub = resumeGithubUsernames.filter(
            (username) => username !== profileGithubUsername
        ).length;
        if (mismatchedResumeGithub > 0) {
            flags.push('Resume GitHub username does not match account GitHub username');
            penalty += 20;
        }
    } else if (projectGithubUsernames.length > 0 || resumeGithubUsernames.length > 0) {
        flags.push('GitHub username not set on account profile; username verification is incomplete');
        penalty += 8;
    }

    // Cap penalty at 100
    penalty = Math.min(100, penalty);

    return { penalty, flags };
}

// ═══════════════════════════════════════════════════════════════
// MAIN SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate the full fit score for a referral application.
 *
 * @param {Object} params
 * @param {Object} params.student       - User document (student)
 * @param {Object} params.referral      - Referral document
 * @param {string} params.resumeText    - Parsed resume text
 * @param {Array}  params.projectLinks  - [{ title, url, type }]
 * @param {Array}  params.existingHashes - Existing resume hashes for dedup
 * @param {string} params.resumeHash    - This application's resume hash
 * @returns {Object} { fitScore, totalScore, fraudFlags }
 */
function calculateFitScore({
    student,
    referral,
    resumeText,
    projectLinks,
    existingHashes,
    resumeHash,
}) {
    const text = resumeText || '';

    // 1. Skills match (30%)
    const skills = scoreSkillsMatch(
        text,
        student.skills,
        referral.requiredSkills
    );

    // 2. Projects / experience depth (25%)
    const projects = scoreProjectDepth(text, projectLinks);

    // 3. Education match (15%)
    const education = scoreEducationMatch(student, referral);

    // 4. Resume completeness (10%)
    const resume = scoreResumeCompleteness(text);

    // 5. CGPA (10%)
    const cgpa = scoreCGPA(student.cgpa, referral.minCGPA);

    // 6. Fraud detection (-10%)
    const fraud = detectFraud({
        resumeText: text,
        profileSkills: student.skills,
        requiredSkills: referral.requiredSkills,
        resumeHash,
        existingHashes,
        student,
        projectLinks,
    });

    // Weighted total
    const weightedTotal = Math.round(
        skills.score * 0.30 +
        projects.score * 0.25 +
        education.score * 0.15 +
        resume.score * 0.10 +
        cgpa.score * 0.10 -
        fraud.penalty * 0.10
    );

    const totalScore = Math.max(0, Math.min(100, weightedTotal));

    const fitScore = {
        skillsMatch: skills.score,
        projectDepth: projects.score,
        educationMatch: education.score,
        resumeCompleteness: resume.score,
        cgpaScore: cgpa.score,
        fraudPenalty: fraud.penalty,
    };

    return {
        fitScore,
        totalScore,
        fraudFlags: fraud.flags,
        breakdown: {
            skills,
            projects,
            education,
            resume,
            cgpa,
            fraud,
        },
    };
}

// ═══════════════════════════════════════════════════════════════
// ELIGIBILITY GATE (pre-score hard checks)
// ═══════════════════════════════════════════════════════════════

/**
 * Check hard eligibility before scoring.
 * Returns { eligible: true } or { eligible: false, reason: string }
 */
function checkEligibility(student, referral) {
    // 1. Banned check
    if (student.isBanned) {
        return { eligible: false, reason: 'Your account has been suspended' };
    }

    // 2. Referral still open
    if (referral.status !== 'open') {
        return { eligible: false, reason: 'This referral is no longer accepting applications' };
    }

    // 3. Deadline passed
    if (new Date(referral.deadline) < new Date()) {
        return { eligible: false, reason: 'Application deadline has passed' };
    }

    // 4. Max applications reached
    if (referral.applicationsCount >= referral.maxApplications) {
        return { eligible: false, reason: 'Maximum number of applications reached' };
    }

    // 5. Branch check
    const eligibleBranches = (referral.eligibleBranches || []).map((b) =>
        b.toLowerCase().trim()
    );
    const studentBranch = (student.branch || '').toLowerCase().trim();
    if (eligibleBranches.length > 0 && studentBranch) {
        const branchMatch = eligibleBranches.some(
            (b) => b === studentBranch || studentBranch.includes(b) || b.includes(studentBranch)
        );
        if (!branchMatch) {
            return {
                eligible: false,
                reason: `Your branch (${student.branch}) is not eligible. Required: ${referral.eligibleBranches.join(', ')}`,
            };
        }
    }

    // 6. CGPA check
    if (referral.minCGPA > 0) {
        if (student.cgpa === null || student.cgpa === undefined) {
            return {
                eligible: false,
                reason: 'CGPA is not set in your profile. Please contact admin to verify your CGPA.',
            };
        }
        if (student.cgpa < referral.minCGPA) {
            return {
                eligible: false,
                reason: `Your CGPA (${student.cgpa}) is below the minimum requirement (${referral.minCGPA})`,
            };
        }
    }

    // 7. Graduation year check
    const eligibleYears = referral.eligibleYears || [];
    if (eligibleYears.length > 0 && student.graduationYear) {
        if (!eligibleYears.includes(student.graduationYear)) {
            return {
                eligible: false,
                reason: `Your graduation year (${student.graduationYear}) is not eligible. Required: ${eligibleYears.join(', ')}`,
            };
        }
    }

    return { eligible: true };
}

// ═══════════════════════════════════════════════════════════════
// RESUME HASH UTILITY
// ═══════════════════════════════════════════════════════════════

function generateResumeHash(resumeText) {
    if (!resumeText) return '';
    const normalized = resumeText.toLowerCase().replace(/\s+/g, ' ').trim();
    return crypto.createHash('md5').update(normalized).digest('hex');
}

module.exports = {
    calculateFitScore,
    checkEligibility,
    generateResumeHash,
    // Exported for testing
    scoreSkillsMatch,
    scoreProjectDepth,
    scoreEducationMatch,
    scoreResumeCompleteness,
    scoreCGPA,
    detectFraud,
};
