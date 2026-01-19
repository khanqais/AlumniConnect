const express = require('express');
const router = express.Router();
const {
    askQuestion,
    getQuestions,
    getQuestionById,
    postAnswer,
    acceptAnswer,
    upvoteAnswer,
} = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getQuestions);
router.post('/ask', protect, askQuestion);
router.get('/:id', getQuestionById);
router.post('/answer/:id', protect, postAnswer);
router.post('/accept/:id', protect, acceptAnswer);
router.post('/upvote/:id', protect, upvoteAnswer);

module.exports = router;
