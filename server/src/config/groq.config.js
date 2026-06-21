import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const MODEL_NAME = 'llama3-70b-8192'; // or 'mixtral-8x7b-32768'

export const generateContent = async (prompt) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: MODEL_NAME,
    temperature: 0.7,
  });
  return chatCompletion.choices[0]?.message?.content || "";
};
