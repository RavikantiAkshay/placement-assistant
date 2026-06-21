import { generateContent } from '../config/groq.config.js';

export const askGroq = async (prompt) => {
  try {
    const response = await generateContent(prompt);
    if (!response) {
      throw new Error('Groq returned an empty response');
    }
    return response;
  } catch (error) {
    console.error('Groq Service Error:', error);
    throw new Error('Failed to communicate with AI interviewer. Please try again.');
  }
};
