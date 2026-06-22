import * as interviewService from '../services/interview.service.js';
import User from '../models/User.model.js';

export const startInterview = async (req, res, next) => {
  try {
    const { role, difficulty, resumeText, totalQuestions } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Please select a role for the interview.' });
    }

    const user = await User.findById(req.user._id);

    const result = await interviewService.startInterview(
      req.user._id,
      role,
      difficulty,
      resumeText,
      user?.name || 'Candidate',
      totalQuestions || 5
    );

    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req, res, next) => {
  try {
    const interview = await interviewService.getInterviewById(req.params.id, req.user._id);
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const submitTextAnswer = async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer) {
      return res.status(400).json({ success: false, message: 'Answer text is required' });
    }
    const result = await interviewService.submitAnswer(req.params.id, req.user._id, answer);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getAllInterviews = async (req, res, next) => {
  try {
    const interviews = await interviewService.getInterviews(req.user._id);
    res.json({ success: true, data: interviews });
  } catch (error) {
    next(error);
  }
};

export const getFeedback = async (req, res, next) => {
  try {
    const interview = await interviewService.generateFeedback(req.params.id, req.user._id);
    res.json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const deleteInterview = async (req, res, next) => {
  try {
    await interviewService.deleteInterview(req.params.id, req.user._id);
    res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (error) {
    next(error);
  }
};

import { transcribeAudio as groqTranscribe } from '../services/groq.service.js';
import fs from 'fs';

export const transcribeAudioEndpoint = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio file uploaded' });
    }
    
    // Call groq service
    const transcript = await groqTranscribe(req.file.path);
    
    // Clean up temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch(e) {
      console.warn("Failed to delete temp audio file:", e);
    }
    
    res.json({ success: true, text: transcript });
  } catch (error) {
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch(e) {}
    }
    next(error);
  }
};
