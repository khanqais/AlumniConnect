const Question = require('../models/Question');


const askQuestion = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const question = await Question.create({
            type: 'question',
            title,
            description,
            category,
            tags: tagsArray,
            askedBy: req.user._id,
            askedByName: req.user.name,
        });

        res.status(201).json({
            success: true,
            message: 'Question posted successfully!',
            question,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const createPoll = async (req, res) => {
    try {
        const { title, options, category, tags } = req.body;

        if (!Array.isArray(options) || options.length < 2) {
            return res.status(400).json({ message: 'Poll must have at least two options' });
        }

        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
        const pollOptions = options
            .map((optionText) => String(optionText || '').trim())
            .filter(Boolean)
            .map(optionText => ({ optionText, votes: [] }));

        if (pollOptions.length < 2) {
            return res.status(400).json({ message: 'Poll must have at least two valid options' });
        }

        const poll = await Question.create({
            type: 'poll',
            title,
            description: 'Poll',
            category,
            tags: tagsArray,
            pollOptions,
            askedBy: req.user._id,
            askedByName: req.user.name,
        });

        res.status(201).json({
            success: true,
            message: 'Poll created successfully!'
            ,
            poll,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getQuestions = async (req, res) => {
    try {
        const { category, search, filter } = req.query;
        let query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (filter === 'unanswered') {
            query['answers.0'] = { $exists: false };
        } else if (filter === 'solved') {
            query.isSolved = true;
        }

        const questions = await Question.find(query)
            .populate('askedBy', 'name role avatar')
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('askedBy', 'name role collegeName avatar')
            .populate('answers.user', 'name role avatar');

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.views += 1;
        await question.save();

        res.json(question);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const postAnswer = async (req, res) => {
    try {
        const { answer } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        question.answers.push({
            user: req.user._id,
            userName: req.user.name,
            answer,
        });

        await question.save();

        res.json({
            success: true,
            message: 'Answer posted successfully',
            answers: question.answers,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const acceptAnswer = async (req, res) => {
    try {
        const { answerId } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }


        if (question.askedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only question asker can accept answer' });
        }


        question.answers.forEach(ans => {
            ans.isAccepted = false;
        });


        const answer = question.answers.id(answerId);
        if (answer) {
            answer.isAccepted = true;
            question.isSolved = true;
        }

        await question.save();

        res.json({
            success: true,
            message: 'Answer accepted',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const upvoteAnswer = async (req, res) => {
    try {
        const { answerId } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const answer = question.answers.id(answerId);
        if (!answer) {
            return res.status(404).json({ message: 'Answer not found' });
        }

        const alreadyUpvoted = answer.upvotedBy.includes(req.user._id);

        if (alreadyUpvoted) {
            answer.upvotes -= 1;
            answer.upvotedBy = answer.upvotedBy.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            answer.upvotes += 1;
            answer.upvotedBy.push(req.user._id);
        }

        await question.save();

        res.json({
            success: true,
            upvotes: answer.upvotes,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const toggleSolved = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }


        if (question.askedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only question asker can mark as solved' });
        }

        question.isSolved = !question.isSolved;
        await question.save();

        res.json({
            success: true,
            message: question.isSolved ? 'Question marked as solved' : 'Question marked as unsolved',
            isSolved: question.isSolved,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const votePoll = async (req, res) => {
    try {
        const { optionIndex } = req.body;
        const poll = await Question.findById(req.params.id);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        if (poll.type !== 'poll') {
            return res.status(400).json({ message: 'This item is not a poll' });
        }

        const index = Number(optionIndex);
        if (Number.isNaN(index) || index < 0 || index >= poll.pollOptions.length) {
            return res.status(400).json({ message: 'Invalid poll option' });
        }

        const alreadyVoted = poll.pollOptions.some(option => option.votes.some(
            (userId) => userId.toString() === req.user._id.toString()
        ));

        if (alreadyVoted) {
            return res.status(400).json({ message: 'You have already voted' });
        }

        poll.pollOptions[index].votes.push(req.user._id);
        await poll.save();

        res.json({
            success: true,
            message: 'Vote recorded',
            poll,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    askQuestion,
    createPoll,
    getQuestions,
    getQuestionById,
    postAnswer,
    acceptAnswer,
    upvoteAnswer,
    toggleSolved,
    votePoll,
};
