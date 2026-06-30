import Doubt from '../models/Doubt.model.js';
import { generateChat, generateVision, transcribeAudio } from '../services/groq.service.js';
import fs from 'fs';

// Helper to format history for Groq
const formatHistory = (messages) => {
  return messages.map(m => ({ role: m.role, content: m.content }));
};

export const createOrUpdateDoubt = async (req, res) => {
  try {
    const { chatId, subject, question, type } = req.body;
    let doubt;

    // Use a default title if creating a new doubt
    const title = question ? (question.substring(0, 30) + (question.length > 30 ? '...' : '')) : `${subject} Doubt`;

    if (chatId) {
      doubt = await Doubt.findOne({ _id: chatId, userId: req.user._id });
      if (!doubt) return res.status(404).json({ message: 'Chat not found' });
    } else {
      doubt = new Doubt({ userId: req.user._id, subject, title });
    }

    let userContent = question || 'Please analyze this upload.';
    let aiResponse = '';
    let inputMode = type || 'text';
    let imageUrl = '';
    let audioUrl = '';

    // Handle Text Input
    if (type === 'text') {
      const history = formatHistory(doubt.messages);
      // Remove system messages to prevent duplication, we'll add one at the top
      const cleanHistory = history.filter(m => m.role !== 'system');
      
      cleanHistory.push({ role: 'user', content: userContent });
      // Add system prompt for socratic tutoring
      cleanHistory.unshift({ role: 'system', content: `You are a helpful and expert AI tutor for ${subject}. Explain concepts clearly using Socratic questioning when appropriate.` });
      
      aiResponse = await generateChat(cleanHistory);
      
      doubt.messages.push({ role: 'user', content: userContent, inputMode });
      doubt.messages.push({ role: 'assistant', content: aiResponse, inputMode: 'text' });
    } 
    // Handle Image Input
    else if (type === 'image' && req.file) {
      const imageBuffer = fs.readFileSync(req.file.path);
      const base64Image = imageBuffer.toString('base64');
      
      imageUrl = `/uploads/${req.file.filename}`;
      
      aiResponse = await generateVision(userContent, base64Image);
      
      doubt.messages.push({ role: 'user', content: userContent, inputMode, imageUrl });
      doubt.messages.push({ role: 'assistant', content: aiResponse, inputMode: 'text' });
    }
    // Handle Voice Input
    else if (type === 'voice' && req.file) {
      // Transcribe first
      const transcription = await transcribeAudio(req.file.path);
      userContent = transcription;
      audioUrl = `/uploads/${req.file.filename}`;
      
      const history = formatHistory(doubt.messages);
      const cleanHistory = history.filter(m => m.role !== 'system');
      cleanHistory.push({ role: 'user', content: userContent });
      cleanHistory.unshift({ role: 'system', content: `You are a helpful and expert AI tutor for ${subject}. Explain concepts clearly using Socratic questioning when appropriate.` });
      
      aiResponse = await generateChat(cleanHistory);
      
      doubt.messages.push({ role: 'user', content: userContent, inputMode, audioUrl });
      doubt.messages.push({ role: 'assistant', content: aiResponse, inputMode: 'text' });
    }

    await doubt.save();
    res.json(doubt);
  } catch (error) {
    console.error('Doubt error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDoubtById = async (req, res) => {
  try {
    const doubt = await Doubt.findOne({ _id: req.params.id, userId: req.user._id });
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    res.json(doubt);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!doubt) return res.status(404).json({ message: 'Doubt not found' });
    res.json({ message: 'Doubt chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
