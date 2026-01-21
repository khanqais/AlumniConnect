const express = require('express');
const router = express.Router();
const {
    askQuestion,
    getQuestions,
    getQuestionById,
    postAnswer,
    acceptAnswer,
    upvoteAnswer,
    toggleSolved,
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getQuestions);
router.post('/ask', protect, askQuestion);
router.get('/:id', getQuestionById);
router.post('/answer/:id', protect, postAnswer);
router.post('/accept/:id', protect, acceptAnswer);
router.post('/upvote/:id', protect, upvoteAnswer);
router.post('/toggle-solved/:id', protect, toggleSolved);

module.exports = router;
