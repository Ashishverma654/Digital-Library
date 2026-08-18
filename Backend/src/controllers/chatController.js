const { generateChatResponse } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Process a chat message from the user
// @route   POST /api/chat
// @access  Private
exports.processChatMessage = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const aiResponse = await generateChatResponse(message, userId);

  res.status(200).json({
    success: true,
    data: {
      reply: aiResponse
    }
  });
});
