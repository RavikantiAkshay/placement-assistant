import DoubtChat from '../models/Doubt.model.js';
import { detectSubject, solveDoubt } from '../services/doubt.service.js';
import { transcribeAudio } from '../services/groq.service.js';
import fs from 'fs';

export const getChats = async (req, res) => {
  try {
    const chats = await DoubtChat.find({ userId: req.user._id })
      .select('title subject lastActivity createdAt')
      .sort({ lastActivity: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChatById = async (req, res) => {
  try {
    const chat = await DoubtChat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createChat = async (req, res) => {
  try {
    const chat = await DoubtChat.create({
      userId: req.user._id,
      title: 'New Doubt',
      messages: []
    });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chat = await DoubtChat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });
    res.json({ message: 'Chat deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const askTextDoubt = async (req, res) => {
  try {
    const { question, subject } = req.body;
    const chat = await DoubtChat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    const detectedSubject = subject || detectSubject(question);
    if (chat.subject === 'General' && detectedSubject !== 'General') {
      chat.subject = detectedSubject;
    }

    const userMessage = { role: 'user', content: question, inputMode: 'text' };
    chat.messages.push(userMessage);

    const historyForAi = chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const answer = await solveDoubt(historyForAi);

    const assistantMessage = { role: 'assistant', content: answer };
    chat.messages.push(assistantMessage);

    await chat.save();
    
    // Return only the two new messages
    res.json({ userMessage: chat.messages[chat.messages.length - 2], assistantMessage: chat.messages[chat.messages.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error processing doubt' });
  }
};

export const askImageDoubt = async (req, res) => {
  try {
    const { question, subject } = req.body;
    const chat = await DoubtChat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = `data:${req.file.mimetype};base64,${imageBuffer.toString('base64')}`;

    const textPrompt = question || 'Please explain this image.';
    const userMessage = { role: 'user', content: textPrompt, inputMode: 'image', imageUrl: base64Image };
    chat.messages.push(userMessage);

    const historyForAi = chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const answer = await solveDoubt(historyForAi, base64Image);

    const assistantMessage = { role: 'assistant', content: answer };
    chat.messages.push(assistantMessage);

    await chat.save();

    // Clean up
    fs.unlinkSync(req.file.path);

    res.json({ userMessage: chat.messages[chat.messages.length - 2], assistantMessage: chat.messages[chat.messages.length - 1] });
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error processing image doubt' });
  }
};

export const askVoiceDoubt = async (req, res) => {
  try {
    const { subject } = req.body;
    const chat = await DoubtChat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    if (!req.file) {
      return res.status(400).json({ message: 'Audio is required' });
    }

    const question = await transcribeAudio(req.file.path);
    
    const userMessage = { role: 'user', content: question, inputMode: 'voice' };
    chat.messages.push(userMessage);

    const historyForAi = chat.messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    const answer = await solveDoubt(historyForAi);

    const assistantMessage = { role: 'assistant', content: answer };
    chat.messages.push(assistantMessage);

    await chat.save();

    // Clean up
    fs.unlinkSync(req.file.path);

    res.json({ userMessage: chat.messages[chat.messages.length - 2], assistantMessage: chat.messages[chat.messages.length - 1] });
  } catch (error) {
    console.error(error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ message: 'Error processing voice doubt' });
  }
};

export const getStats = async (req, res) => {
  try {
    const chats = await DoubtChat.find({ userId: req.user._id });
    const totalDoubts = chats.reduce((acc, chat) => acc + Math.floor(chat.messages.length / 2), 0);
    const subjects = new Set(chats.map(chat => chat.subject).filter(s => s !== 'General'));
    
    res.json({
      totalChats: chats.length,
      totalDoubts,
      subjectsCovered: subjects.size
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
