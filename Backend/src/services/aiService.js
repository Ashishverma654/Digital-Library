const { GoogleGenAI, createUserContent, createModelContent, createPartFromFunctionCall, createPartFromFunctionResponse } = require('@google/genai');
const { tools, toolDeclarations } = require('./libraryTools');

const generateChatResponse = async (userMessage, userId, userRole = 'STUDENT') => {
  if (!process.env.GEMINI_API_KEY) {
    return "I am currently offline. Please add the `GEMINI_API_KEY` to the Backend `.env` file to activate me!";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const filteredDeclarations = toolDeclarations.filter(decl => {
    return !decl.allowedRoles || decl.allowedRoles.includes(userRole);
  }).map(decl => {
    const { allowedRoles, ...rest } = decl;
    return rest;
  });

  const libraryTool = {
    functionDeclarations: filteredDeclarations
  };

  let roleInstruction = '';
  if (userRole === 'ADMIN') {
    roleInstruction = 'You are speaking to a SUPER ADMIN. You can provide administrative assistance and system overviews. You have full admin-level access.';
  } else if (userRole === 'LIBRARIAN') {
    roleInstruction = 'You are speaking to a LIBRARIAN. You can assist them with managing books, viewing student transactions, and library operations.';
  } else {
    roleInstruction = 'You are speaking to a STUDENT. You can help them find books, check book availability, and view their borrowed books and unpaid fines.';
  }

  const systemInstruction = `You are a helpful and polite AI Library Assistant for a college Digital Library.
${roleInstruction}
If you need to execute a tool, use it. The system automatically handles their user identity.
If they ask something completely unrelated to the library, politely decline to answer.
Keep your responses concise and friendly.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: userMessage,
      config: {
        systemInstruction,
        tools: [libraryTool],
      }
    });

    // Check if the model decided to call a function
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const functionName = call.name;
      const functionArgs = { ...(call.args || {}) };
      
      // Inject userId for user-specific tools
      if (['getMyBorrowedBooks', 'getMyFines'].includes(functionName)) {
        functionArgs.userId = userId;
      }
      
      if (tools[functionName]) {
        try {
          // Execute the local tool
          const apiResponse = await tools[functionName](functionArgs);
          
          // Build the conversation history with proper SDK Content objects:
          // 1. User message
          // 2. Model's function call (wrapped as a Part)
          // 3. Function response (wrapped as a Part with role 'user')
          // Gemini API requires functionResponse.response to be an object, not an array
          const wrappedResponse = Array.isArray(apiResponse) ? { result: apiResponse } : apiResponse;
          const functionResponsePart = createPartFromFunctionResponse(call.id || '', functionName, wrappedResponse);

          const contents = [
            createUserContent(userMessage),
            response.candidates[0].content,
            { role: 'user', parts: [functionResponsePart] }
          ];

          // Send the result back to Gemini to formulate a natural language response
          const secondResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash-lite',
            contents,
            config: {
              systemInstruction,
              tools: [libraryTool],
            }
          });
          
          return secondResponse.text || "I processed your request but couldn't generate a response.";
        } catch (error) {
          console.error("Tool execution error:", error.message);
          return "I encountered an error while checking the library database. Please try again later.";
        }
      }
    }
    
    return response.text || "I'm not sure how to respond to that. Can you try rephrasing?";
  } catch (error) {
    console.error("AI Service Error:", error.message);
    if (error.message && error.message.includes('API_KEY')) {
      return "My API key seems to be invalid. Please check the GEMINI_API_KEY in the Backend .env file.";
    }
    return "I'm having trouble connecting to my AI brain right now. Please try again later.";
  }
};

module.exports = { generateChatResponse };
