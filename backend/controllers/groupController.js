const mongoose = require('mongoose');
const AlumniGroup = require('../models/AlumniGroup');
const GroupInvite = require('../models/GroupInvite');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

const createGroup = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can create groups' });
        }

        const groupName = String(req.body.name || '').trim();
        const description = String(req.body.description || '').trim();

        if (!groupName) {
            return res.status(400).json({ message: 'Group name is required' });
        }

        if (!req.user.graduationYear) {
            return res.status(400).json({ message: 'Graduation year is required on your profile to create a batch group' });
        }

        const group = await AlumniGroup.create({
            name: groupName,
            description,
            batchYear: req.user.graduationYear,
            createdBy: req.user._id,
            members: [req.user._id],
        });

        res.status(201).json({ success: true, group });
    } catch (error) {
        console.error('Error creating alumni group:', error);
        res.status(500).json({ message: 'Failed to create group' });
    }
};

const sendGroupInvites = async (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ message: 'Only alumni can send group invites' });
        }

        const { groupId } = req.params;
        const recipientIds = Array.isArray(req.body.recipientIds) ? req.body.recipientIds : [];
        const message = String(req.body.message || '').trim();

        if (!mongoose.Types.ObjectId.isValid(groupId)) {
            return res.status(400).json({ message: 'Invalid group id' });
        }

        if (recipientIds.length === 0) {
            return res.status(400).json({ message: 'Please select at least one alumni to invite' });
        }

        const group = await AlumniGroup.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only group creator can invite alumni' });
        }

        const normalizedRecipientIds = [...new Set(recipientIds)]
            .filter((id) => mongoose.Types.ObjectId.isValid(id))
            .map((id) => id.toString());

        const candidates = await User.find({
            _id: { $in: normalizedRecipientIds },
        }).select('_id name role isApproved isEmailVerified graduationYear');

        const candidateMap = new Map(candidates.map((candidate) => [candidate._id.toString(), candidate]));
        const alreadyMembers = new Set(group.members.map((memberId) => memberId.toString()));

        const results = {
            invited: 0,
            skipped: [],
        };

        for (const recipientId of normalizedRecipientIds) {
            if (recipientId === req.user._id.toString()) {
                results.skipped.push({ recipientId, reason: 'self' });
                continue;
            }

            const candidate = candidateMap.get(recipientId);
            if (!candidate) {
                results.skipped.push({ recipientId, reason: 'user_not_found' });
                continue;
            }

            if (candidate.role !== 'alumni') {
                results.skipped.push({ recipientId, recipientName: candidate.name, reason: 'not_alumni' });
                continue;
            }

            if (!candidate.isApproved || !candidate.isEmailVerified) {
                results.skipped.push({ recipientId, recipientName: candidate.name, reason: 'not_active_alumni' });
                continue;
            }

            if (alreadyMembers.has(recipientId)) {
                results.skipped.push({ recipientId, recipientName: candidate.name, reason: 'already_member' });
                continue;
            }

            const existingInvite = await GroupInvite.findOne({ group: group._id, recipient: recipientId });
            if (existingInvite && existingInvite.status === 'pending') {
                results.skipped.push({ recipientId, recipientName: candidate.name, reason: 'invite_pending' });
                continue;
            }

            let invite;
            if (existingInvite && existingInvite.status !== 'pending') {
                existingInvite.status = 'pending';
                existingInvite.sender = req.user._id;
                existingInvite.message = message;
                invite = await existingInvite.save();
            } else {
                invite = await GroupInvite.create({
                    group: group._id,
                    sender: req.user._id,
                    recipient: recipientId,
                    status: 'pending',
                    message,
                });
            }

            await createNotification({
                recipient: recipientId,
                sender: req.user._id,
                type: 'group_invite',
                title: `Group invite: ${group.name}`,
                message: `${req.user.name} invited you to join the ${group.batchYear} batch group.${message ? ` ${message}` : ''}`,
                link: '/groups/invites',
                relatedId: invite._id,
            });

            results.invited += 1;
        }

        res.json({ success: true, results });
    } catch (error) {
        console.error('Error sending group invites:', error);
        res.status(500).json({ message: 'Failed to send invites' });
    }
};

const getMyInvites = async (req, res) => {
    try {
        const invites = await GroupInvite.find({ recipient: req.user._id, status: 'pending' })
            .populate({
                path: 'group',
                select: 'name batchYear description createdBy',
                populate: { path: 'createdBy', select: 'name avatar' },
            })
            .populate('sender', 'name avatar')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, invites });
    } catch (error) {
        console.error('Error fetching group invites:', error);
        res.status(500).json({ message: 'Failed to fetch invites' });
    }
};

const respondToInvite = async (req, res) => {
    try {
        const { inviteId } = req.params;
        const action = String(req.body.action || '').toLowerCase();

        if (!mongoose.Types.ObjectId.isValid(inviteId)) {
            return res.status(400).json({ message: 'Invalid invite id' });
        }

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be accept or reject' });
        }

        const invite = await GroupInvite.findOne({ _id: inviteId, recipient: req.user._id }).populate('group');
        if (!invite) {
            return res.status(404).json({ message: 'Invite not found' });
        }

        if (invite.status !== 'pending') {
            return res.status(400).json({ message: `Invite already ${invite.status}` });
        }

        if (action === 'accept') {
            await AlumniGroup.findByIdAndUpdate(invite.group._id, {
                $addToSet: { members: req.user._id },
            });
            invite.status = 'accepted';

            await createNotification({
                recipient: invite.sender,
                sender: req.user._id,
                type: 'group_invite',
                title: `${req.user.name} joined ${invite.group.name}`,
                message: `${req.user.name} accepted your group invitation.`,
                link: '/groups/invites',
                relatedId: invite.group._id,
            });
        } else {
            invite.status = 'rejected';

            await createNotification({
                recipient: invite.sender,
                sender: req.user._id,
                type: 'group_invite',
                title: `${req.user.name} declined ${invite.group.name}`,
                message: `${req.user.name} declined your group invitation.`,
                link: '/groups/invites',
                relatedId: invite.group._id,
            });
        }

        await invite.save();
        res.json({ success: true, invite });
    } catch (error) {
        console.error('Error responding to invite:', error);
        res.status(500).json({ message: 'Failed to respond to invite' });
    }
};

const getMyGroups = async (req, res) => {
    try {
        const groups = await AlumniGroup.find({ members: req.user._id })
            .populate('createdBy', 'name avatar graduationYear')
            .populate('members', 'name avatar graduationYear')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, groups });
    } catch (error) {
        console.error('Error fetching my groups:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
};

module.exports = {
    createGroup,
    sendGroupInvites,
    getMyInvites,
    respondToInvite,
    getMyGroups,
};