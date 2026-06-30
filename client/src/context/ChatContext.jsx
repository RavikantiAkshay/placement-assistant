import React, { createContext, useState, useEffect } from 'react';
import { createOrUpdateDoubt, fetchDoubts, fetchDoubtById, deleteDoubtAPI } from '../services/doubt.service';
import toast from 'react-hot-toast';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const res = await fetchDoubts();
      setChats(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chat history');
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadChats();
    }
  }, []);

  const selectChat = async (id) => {
    try {
      setSendingMessage(true);
      const res = await fetchDoubtById(id);
      setActiveChat(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load chat details');
    } finally {
      setSendingMessage(false);
    }
  };

  const createNewChat = () => {
    setActiveChat(null);
  };

  const askText = async (chatId, question, subject) => {
    setSendingMessage(true);
    const newMsg = { _id: Date.now().toString(), role: 'user', content: question, inputMode: 'text' };
    setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : { messages: [newMsg], subject });

    try {
      const res = await createOrUpdateDoubt({ chatId, question, subject, type: 'text' });
      setActiveChat(res.data);
      if (!chatId) loadChats();
      return res.data._id; // Return the ID so we can navigate to it
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
      return null;
    } finally {
      setSendingMessage(false);
    }
  };

  const askImage = async (chatId, imageFile, question, subject) => {
    setSendingMessage(true);
    const imageUrl = URL.createObjectURL(imageFile);
    const newMsg = { _id: Date.now().toString(), role: 'user', content: question || 'Uploaded Image', imageUrl, inputMode: 'image' };
    setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : { messages: [newMsg], subject });

    try {
      const formData = new FormData();
      if (chatId) formData.append('chatId', chatId);
      formData.append('subject', subject);
      if (question) formData.append('question', question);
      formData.append('type', 'image');
      formData.append('file', imageFile);

      const res = await createOrUpdateDoubt(formData);
      setActiveChat(res.data);
      if (!chatId) loadChats();
      return res.data._id;
    } catch (err) {
      console.error(err);
      toast.error('Failed to send image');
      return null;
    } finally {
      setSendingMessage(false);
    }
  };

  const askVoice = async (chatId, audioBlob, subject) => {
    setSendingMessage(true);
    const audioUrl = URL.createObjectURL(audioBlob);
    const newMsg = { _id: Date.now().toString(), role: 'user', content: 'Audio Doubt', audioUrl, inputMode: 'voice' };
    setActiveChat(prev => prev ? { ...prev, messages: [...prev.messages, newMsg] } : { messages: [newMsg], subject });

    try {
      const formData = new FormData();
      if (chatId) formData.append('chatId', chatId);
      formData.append('subject', subject);
      formData.append('type', 'voice');
      const audioFile = new File([audioBlob], 'voice-message.webm', { type: 'audio/webm' });
      formData.append('file', audioFile);

      const res = await createOrUpdateDoubt(formData);
      setActiveChat(res.data);
      if (!chatId) loadChats();
      return res.data._id;
    } catch (err) {
      console.error(err);
      toast.error('Failed to send voice message');
      return null;
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteChat = async (id) => {
    try {
      // Optimistic update
      setChats(prev => prev.filter(c => c._id !== id));
      if (activeChat?._id === id) setActiveChat(null);
      
      await deleteDoubtAPI(id);
      toast.success('Chat deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete chat');
      loadChats(); // Revert on failure
    }
  };

  return (
    <ChatContext.Provider value={{
      chats, activeChat, setActiveChat, loadingChats, sendingMessage,
      loadChats, selectChat, createNewChat, deleteChat,
      askText, askImage, askVoice
    }}>
      {children}
    </ChatContext.Provider>
  );
};
