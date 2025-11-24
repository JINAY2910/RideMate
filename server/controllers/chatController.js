const aiService = require('../services/aiService');

// @desc    Chat with AI
// @route   POST /api/chat
// @access  Private
const handleChat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        const response = await aiService.chat(message, userId);

        res.json({
            success: true,
            message: response,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    handleChat,
};
