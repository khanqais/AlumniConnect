const Question = require('../models/Question');

// Ask a question
const askQuestion = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const question = await Question.create({
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

// Get all questions
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
            .populate('askedBy', 'name role')
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single question
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('askedBy', 'name role collegeName')
            .populate('answers.user', 'name role');

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

// Post answer
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

// Accept answer
const acceptAnswer = async (req, res) => {
    try {
        const { answerId } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        // Only question asker can accept answer
        if (question.askedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only question asker can accept answer' });
        }

        // Mark all as not accepted first
        question.answers.forEach(ans => {
            ans.isAccepted = false;
        });

        // Mark selected answer as accepted
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

// Upvote answer
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

module.exports = {
    askQuestion,
    getQuestions,
    getQuestionById,
    postAnswer,
    acceptAnswer,
    upvoteAnswer,
};
