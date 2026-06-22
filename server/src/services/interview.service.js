import Interview from '../models/Interview.model.js';
import { askGroq } from './groq.service.js';
import { parseGroqJSON } from '../utils/prompts.utils.js';
import { 
  GENERATE_QUESTIONS_PROMPT, 
  INTERVIEW_GREETING_PROMPT, 
  FOLLOW_UP_PROMPT, 
  GENERATE_FEEDBACK_PROMPT, 
  buildConversationHistory 
} from '../constants/prompts.js';

export const startInterview = async (userId, role, difficulty, resumeText, candidateName, totalQuestions = 5) => {
  // Removed daily limit constraint for development

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

export const getInterviewById = async (interviewId, userId) => {
  const interview = await Interview.findOne({ _id: interviewId, userId });
  if (!interview) {
    throw new Error('Interview not found');
  }
  return interview;
};

export const submitAnswer = async (interviewId, userId, answerText) => {
  const interview = await getInterviewById(interviewId, userId);
  
  if (interview.status === 'completed') {
    throw new Error('Interview is already completed');
  }

  // 1. Add candidate's answer to history
  interview.messages.push({ role: 'candidate', content: answerText });

  // 2. Check if we reached the end
  let nextQuestion = '';
  if (interview.currentQuestion < interview.totalQuestions) {
    nextQuestion = interview.questions[interview.currentQuestion];
    interview.currentQuestion += 1;
  } else {
    // End of interview
    interview.status = 'completed';
    const farewell = "That was the last question! Thank you for your time. Your feedback report is being generated.";
    interview.messages.push({ role: 'ai', content: farewell });
    await interview.save();
    return { aiResponse: farewell, isCompleted: true };
  }

  // 3. Get follow-up / reaction from Groq
  const historyString = buildConversationHistory(interview.messages.slice(-6)); // Keep recent context
  const prompt = FOLLOW_UP_PROMPT(interview.role, historyString, nextQuestion);
  const aiResponse = await askGroq(prompt);

  // 4. Add AI response to history
  interview.messages.push({ role: 'ai', content: aiResponse });
  await interview.save();

  return { aiResponse, isCompleted: false, currentQuestion: interview.currentQuestion };
};

export const getInterviews = async (userId) => {
  return await Interview.find({ userId }).sort({ createdAt: -1 });
};

export const generateFeedback = async (interviewId, userId) => {
  const interview = await getInterviewById(interviewId, userId);
  
  if (interview.feedback) {
    return interview; // Already generated
  }

  const historyString = buildConversationHistory(interview.messages);
  const prompt = GENERATE_FEEDBACK_PROMPT(interview.role, interview.difficulty, historyString);
  
  const aiResponse = await askGroq(prompt);
  const feedbackData = parseGroqJSON(aiResponse);

  interview.feedback = feedbackData;
  interview.overallScore = feedbackData.overallScore || 0;
  await interview.save();

  return interview;
};

export const deleteInterview = async (interviewId, userId) => {
  const interview = await Interview.findOneAndDelete({ _id: interviewId, userId });
  if (!interview) {
    throw new Error('Interview not found or unauthorized to delete');
  }
  return interview;
};
