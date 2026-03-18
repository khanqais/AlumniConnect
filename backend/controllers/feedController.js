const Resource = require('../models/Resource');
const Blog = require('../models/Blog');
const Question = require('../models/Question');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');


const getFeed = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const filter = req.query.filter || 'all'; // all | resource | blog | question | event | announcement

        const perSource = limit * 2; // fetch more than needed before merge-sort

        const promises = [];

        if (filter === 'all' || filter === 'resource') {
            promises.push(
                Resource.find({ isApproved: true })
                    .select('title description category uploaderName uploaderRole tags likes downloads createdAt uploadedBy')
                    .populate('uploadedBy', 'avatar')
                    .sort({ createdAt: -1 })
                    .limit(perSource)
                    .lean()
                    .then(docs =>
                        docs.map(d => ({
                            _id: d._id,
                            type: 'resource',
                            title: d.title,
                            description: d.description,
                            category: d.category,
                            actorName: d.uploaderName || 'Unknown',
                            actorRole: d.uploaderRole || '',
                            actorAvatar: d.uploadedBy?.avatar || '',
                            meta: {
                                likes: d.likes || 0,
                                downloads: d.downloads || 0,
                                tags: d.tags || [],
                            },
                            createdAt: d.createdAt,
                        }))
                    )
            );
        }

        if (filter === 'all' || filter === 'blog') {
            promises.push(
                Blog.find({ isPublished: true })
                    .select('title excerpt category authorName tags likes views readTime createdAt author')
                    .populate('author', 'avatar')
                    .sort({ createdAt: -1 })
                    .limit(perSource)
                    .lean()
                    .then(docs =>
                        docs.map(d => ({
                            _id: d._id,
                            type: 'blog',
                            title: d.title,
                            description: d.excerpt,
                            category: d.category,
                            actorName: d.authorName || 'Unknown',
                            actorRole: 'author',
                            actorAvatar: d.author?.avatar || '',
                            meta: {
                                likes: d.likes || 0,
                                views: d.views || 0,
                                readTime: d.readTime || null,
                                tags: d.tags || [],
                            },
                            createdAt: d.createdAt,
                        }))
                    )
            );
        }

        if (filter === 'all' || filter === 'question') {
            promises.push(
                Question.find()
                    .select('title description category askedByName tags isSolved answers views createdAt askedBy')
                    .populate('askedBy', 'avatar')
                    .sort({ createdAt: -1 })
                    .limit(perSource)
                    .lean()
                    .then(docs =>
                        docs.map(d => ({
                            _id: d._id,
                            type: 'question',
                            title: d.title,
                            description: d.description,
                            category: d.category,
                            actorName: d.askedByName || 'Unknown',
                            actorRole: 'member',
                            actorAvatar: d.askedBy?.avatar || '',
                            meta: {
                                answers: d.answers ? d.answers.length : 0,
                                views: d.views || 0,
                                isSolved: d.isSolved || false,
                                tags: d.tags || [],
                            },
                            createdAt: d.createdAt,
                        }))
                    )
            );
        }

        if (filter === 'all' || filter === 'event') {
            promises.push(
                Event.find()
                    .select('title description type organizerName date mode status tags registeredUsers createdAt organizer')
                    .populate('organizer', 'avatar')
                    .sort({ createdAt: -1 })
                    .limit(perSource)
                    .lean()
                    .then(docs =>
                        docs.map(d => ({
                            _id: d._id,
                            type: 'event',
                            title: d.title,
                            description: d.description,
                            category: d.type,
                            actorName: d.organizerName || 'Unknown',
                            actorRole: 'organizer',
                            actorAvatar: d.organizer?.avatar || '',
                            meta: {
                                date: d.date,
                                mode: d.mode,
                                status: d.status,
                                registrations: d.registeredUsers ? d.registeredUsers.length : 0,
                                tags: d.tags || [],
                            },
                            createdAt: d.createdAt,
                        }))
                    )
            );
        }

        if (filter === 'all' || filter === 'announcement') {
            promises.push(
                Announcement.find({ isPublished: true })
                    .select('title content category adminName adminEmail views createdAt')
                    .sort({ createdAt: -1 })
                    .limit(perSource)
                    .lean()
                    .then(docs =>
                        docs.map(d => ({
                            _id: d._id,
                            type: 'announcement',
                            title: d.title,
                            description: d.content,
                            category: d.category,
                            actorName: d.adminName || 'Admin',
                            actorRole: 'admin',
                            actorAvatar: '',
                            meta: {
                                views: d.views || 0,
                                tags: [d.category],
                            },
                            createdAt: d.createdAt,
                        }))
                    )
            );
        }

        const results = await Promise.all(promises);


        const allItems = results
            .flat()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        const total = allItems.length;
        const paginated = allItems.slice(skip, skip + limit);

        res.status(200).json({
            success: true,
            data: paginated,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + limit < total,
            },
        });
    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ message: 'Failed to load feed' });
    }
};

module.exports = { getFeed };
