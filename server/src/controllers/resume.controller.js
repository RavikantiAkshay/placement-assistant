import * as resumeService from '../services/resume.service.js';
import Resume from '../models/Resume.model.js';

export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const text = await resumeService.parseResumePDF(req.file.buffer);
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Could not extract text from the PDF' });
    }

    const resume = await resumeService.saveResume(req.user._id, req.file.originalname, text);

    res.json({
      success: true,
      data: {
        resumeId: resume._id,
        fileName: resume.fileName,
        preview: resume.extractedText.substring(0, 500),
        text: resume.extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found' });
    }
    res.json({
      success: true,
      data: {
        resumeId: resume._id,
        fileName: resume.fileName,
        text: resume.extractedText,
      },
    });
  } catch (error) {
    next(error);
  }
};
