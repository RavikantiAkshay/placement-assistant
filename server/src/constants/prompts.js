export const GENERATE_QUESTIONS_PROMPT = (role, difficulty, resumeText, totalQuestions) => `
You are an expert technical interviewer conducting a ${role} interview at ${difficulty} difficulty.
Analyze the candidate's resume below and generate exactly ${totalQuestions - 1} interview questions.
The FIRST question "Tell me about yourself" is already added — do NOT include it.

RULES:
1. Generate a realistic interview flow like real-world interviews:
   - 1-2 behavioral questions (based on their experience, projects, and past roles from resume)
   - Remaining questions should be technical knowledge questions (specific to the ${role} role at ${difficulty} difficulty)
2. RETURN ONLY A RAW JSON ARRAY of strings. Do NOT wrap in markdown or add explanations.

RESUME TEXT:
${resumeText || 'No resume provided. Generate generic role questions.'}
`;

export const INTERVIEW_GREETING_PROMPT = (role, candidateName) => `
You are an expert technical interviewer named Natalie conducting a ${role} interview.
The candidate's name is ${candidateName}.
Generate a brief, welcoming, professional greeting (1-2 sentences max). Do NOT ask the first question yet.
`;

export const buildConversationHistory = (messages) => {
  return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
};
