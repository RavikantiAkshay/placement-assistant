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
