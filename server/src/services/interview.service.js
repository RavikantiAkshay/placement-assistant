import Interview from '../models/Interview.model.js';
import { askGroq } from './groq.service.js';
import { parseGroqJSON } from '../utils/prompts.utils.js';
import { GENERATE_QUESTIONS_PROMPT, INTERVIEW_GREETING_PROMPT } from '../constants/prompts.js';

export const startInterview = async (userId, role, difficulty, resumeText, candidateName, totalQuestions = 5) => {
  // 1. Generate personalized questions from the resume
  const prompt = GENERATE_QUESTIONS_PROMPT(role, difficulty, resumeText, totalQuestions);
  const aiResponse = await askGroq(prompt);
  const questions = parseGroqJSON(aiResponse);

  // 2. Generate the AI greeting
  const greetingPrompt = INTERVIEW_GREETING_PROMPT(role, candidateName);
  const greetingText = await askGroq(greetingPrompt);

  // 3. The first hardcoded question
  const introQuestion = "Tell me about yourself.";
  const fullFirstMessage = `${greetingText} ${introQuestion}`;

  // 4. Save to Database
  const interview = await Interview.create({
    userId,
    role,
    difficulty,
    resumeText,
    totalQuestions,
    questions: [introQuestion, ...questions],
    messages: [
      {
        role: 'ai',
        content: fullFirstMessage,
      },
    ],
  });

  return {
    interviewId: interview._id,
    firstMessage: fullFirstMessage,
    totalQuestions,
  };
};
