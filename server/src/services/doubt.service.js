import { groq } from '../config/groq.config.js';
import fs from 'fs';

const TEXT_MODEL = 'llama-3.3-70b-versatile';
const VISION_MODEL = 'llama-3.2-11b-vision-preview';

const TUTOR_SYSTEM_PROMPT = `You are an expert AI tutor helping students understand concepts.
Provide step-by-step explanations, use markdown, and encourage the student.
If asked about a specific subject, tailor your answer. Use formatting like bold, lists, and code blocks to make it readable.`;

export const detectSubject = (question) => {
  const q = question.toLowerCase();
  if (q.match(/math|equation|calculus|algebra|geometry|integrate/)) return 'Mathematics';
  if (q.match(/physics|velocity|force|gravity|projectile|motion/)) return 'Physics';
  if (q.match(/chemistry|reaction|mole|stoichiometry|acid|base/)) return 'Chemistry';
  if (q.match(/biology|cell|mitosis|dna|rna|protein/)) return 'Biology';
  if (q.match(/code|programming|python|javascript|react|node|html|css|java|c\+\+/)) return 'Computer Science';
  return 'General';
};

export const solveDoubt = async (messages, imageBase64 = null) => {
  try {
    const formattedMessages = [{ role: 'system', content: TUTOR_SYSTEM_PROMPT }];
    
    // Add history
    messages.forEach(msg => {
      formattedMessages.push({
        role: msg.role,
        content: msg.content
      });
    });

    if (imageBase64) {
      // The last message is the user's new question with the image
      const lastMsg = formattedMessages.pop();
      formattedMessages.push({
        role: 'user',
        content: [
          { type: 'text', text: lastMsg.content },
          { type: 'image_url', image_url: { url: imageBase64 } }
        ]
      });
      
      const completion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: VISION_MODEL,
        temperature: 0.5,
      });
      return completion.choices[0]?.message?.content || "";
    } else {
      const completion = await groq.chat.completions.create({
        messages: formattedMessages,
        model: TEXT_MODEL,
        temperature: 0.7,
      });
      return completion.choices[0]?.message?.content || "";
    }
  } catch (error) {
    console.error('Doubt Solver Service Error:', error);
    throw new Error('Failed to generate answer: ' + (error.message || 'Unknown error'));
  }
};
