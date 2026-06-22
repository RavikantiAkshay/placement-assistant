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
You are an expert technical interviewer conducting a ${role} interview.
The candidate's name is ${candidateName}.
Generate a brief, welcoming, professional greeting (1-2 sentences max). Do NOT ask the first question yet.
`;

export const buildConversationHistory = (messages) => {
  return messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
};

export const FOLLOW_UP_PROMPT = (role, history, nextQuestion) => `
You are an expert technical interviewer conducting a ${role} interview.
Here is the conversation history so far:
${history}

The candidate just answered your previous question. 
RULES FOR YOUR RESPONSE:
1. Speak DIRECTLY to the candidate (e.g., "That's a great point...", "You missed...").
2. DO NOT output internal thoughts, reasoning, or third-person commentary like "The candidate stated...". 
3. If their answer was incomplete or wrong, briefly correct them or acknowledge it in 1 sentence.
4. If they were correct, briefly praise them in 1 sentence.
5. Finally, ask the NEXT QUESTION provided below verbatim.

NEXT QUESTION: ${nextQuestion || "That concludes our questions. Thank you for your time!"}
`;

export const GENERATE_FEEDBACK_PROMPT = (role, difficulty, history) => `
You are an expert technical interviewer and hiring manager. The following is a transcript of a ${role} interview at ${difficulty} difficulty.
Analyze the candidate's answers and generate a highly detailed, professional-grade analytics report.

RETURN ONLY A RAW JSON OBJECT with the following structure. Do NOT wrap in markdown or add explanations.
{
  "overallScore": 85,
  "hireabilityScore": 88, // 0-100
  "interviewReadiness": "Interview Ready", // "Beginner", "Developing", "Interview Ready", "Strong Candidate", "Hire-Ready"
  "predictedRoleFit": [
    { "role": "Frontend Engineer", "percentage": 92 },
    { "role": "Full Stack Engineer", "percentage": 85 }
  ],
  "metrics": {
    "communication": {
      "score": 88,
      "speakingPaceWPM": 145, // estimate based on typical reading speed vs text length
      "fillerWordCount": 12,
      "clarityScore": 90,
      "concisenessScore": 85
    },
    "technical": {
      "score": 82,
      "depthOfKnowledge": 85,
      "problemSolving": 80,
      "bestPractices": 85
    },
    "behavioral": {
      "score": 88,
      "confidenceScore": 90,
      "starAdherence": 85, // percentage
      "decisionMaking": 85
    }
  },
  "topicHeatmap": [
    { "topic": "React.js", "score": 90 },
    { "topic": "System Design", "score": 65 },
    { "topic": "Problem Solving", "score": 80 }
  ],
  "strengths": ["Clear communication", "Good understanding of React hooks"],
  "areasForImprovement": ["Needs to elaborate more on system design tradeoffs", "Reduce filler words"],
  "missingKeywords": ["Scalability", "Memoization", "CI/CD"],
  "sevenDayImprovementPlan": [
    "Day 1-2: Deep dive into System Design scalability patterns.",
    "Day 3-4: Practice answering behavioral questions using strict STAR format."
  ],
  "detailedFeedback": [
    {
      "question": "Tell me about yourself.",
      "candidateAnswer": "I am a web developer...",
      "feedback": "Good intro, but could focus more on recent projects.",
      "score": 8, // out of 10
      "sentiment": "Positive",
      "weakStatements": ["I worked on a project"], // Extract a specific quote that was weak
      "strongStatements": ["I optimized the load time by 40%"], // Extract a specific quote that was strong
      "suggestedAnswer": "I built a React-based task management platform used by 500+ users..."
    }
  ]
}

TRANSCRIPT:
${history}
`;
