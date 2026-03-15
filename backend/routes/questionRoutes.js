const express = require('express');
const router = express.Router();
const {
    askQuestion,
    createPoll,
    getQuestions,
    getQuestionById,
    postAnswer,
    acceptAnswer,
    upvoteAnswer,
    toggleSolved,
    votePoll,
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getQuestions);
router.post('/ask', protect, askQuestion);
router.post('/poll', protect, createPoll);
router.get('/:id', getQuestionById);
router.post('/answer/:id', protect, postAnswer);
router.post('/accept/:id', protect, acceptAnswer);
router.post('/upvote/:id', protect, upvoteAnswer);
router.post('/toggle-solved/:id', protect, toggleSolved);
router.post('/poll/vote/:id', protect, votePoll);

module.exports = router;
