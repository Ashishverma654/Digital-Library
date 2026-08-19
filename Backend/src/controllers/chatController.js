const { generateChatResponse } = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Process a chat message from the user
// @route   POST /api/chat
// @access  Private
exports.processChatMessage = asyncHandler(async (req, res, next) => {
  const { message, fileData, fileName } = req.body;
  const userId = req.user._id;

  if (!message && !fileData) {
    return res.status(400).json({ success: false, message: 'Message or file is required' });
  }

  let finalMessage = message || '';

  if (fileData) {
    try {
      const xlsx = require('xlsx');
      // fileData is expected to be a Base64 string (e.g., data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,....)
      const base64Data = fileData.split(',')[1] || fileData;
      const buffer = Buffer.from(base64Data, 'base64');
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(sheet);
      
      const limitedData = data.slice(0, 100);
      finalMessage += `\n\n[Attached File: ${fileName || 'upload.xlsx'}]\n`;
      finalMessage += `Parsed data (${limitedData.length} rows):\n`;
      finalMessage += JSON.stringify(limitedData);
      
      if (data.length > 100) {
        finalMessage += `\n(Note: File contained ${data.length} rows, but only the first 100 were provided to save context.)`;
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      return res.status(400).json({ success: false, message: 'Failed to parse the uploaded file.' });
    }
  }

  const aiResponse = await generateChatResponse(finalMessage, userId, req.user.role);

  res.status(200).json({
    success: true,
    data: {
      reply: aiResponse
    }
  });
});
