import * as interviewService from '../services/interview.service.js';

export const startInterview = async (req, res, next) => {
  try {
    const { role, difficulty, resumeText, totalQuestions } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Please select a role for the interview.' });
    }

    const result = await interviewService.startInterview(
      req.user._id,
      role,
      difficulty,
      resumeText,
      req.user.name,
      totalQuestions || 5
    );

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
