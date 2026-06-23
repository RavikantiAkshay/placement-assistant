import { generateContent, groq } from '../config/groq.config.js';
import fs from 'fs';

export const askGroq = async (prompt) => {
  try {
    const response = await generateContent(prompt);
    if (!response) {
      throw new Error('Groq returned an empty response');
    }
    return response;
  } catch (error) {
    console.error('Groq Service Error Details:', error);
    throw new Error('Failed to communicate with AI interviewer: ' + (error.message || 'Unknown error'));
  }
};

export const transcribeAudio = async (filePath) => {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: "whisper-large-v3",
      response_format: "json",
      language: "en"
    });
    return transcription.text;
  } catch (error) {
    console.error('Groq Transcription Error Details:', error);
    throw new Error('Failed to transcribe audio: ' + (error.message || 'Unknown error'));
  }
};

export const generateChat = async (messages) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Groq Chat Error Details:', error);
    throw new Error('Failed to generate chat response: ' + (error.message || 'Unknown error'));
  }
};

export const generateVision = async (text, base64Image) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: text },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      model: 'llama-3.2-11b-vision-preview',
      temperature: 0.7,
    });
    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error('Groq Vision Error Details:', error);
    throw new Error('Failed to generate vision response: ' + (error.message || 'Unknown error'));
  }
};
