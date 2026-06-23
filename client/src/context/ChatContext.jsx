import React, { createContext, useState } from 'react';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState({
    _id: 'dummy_1',
    title: 'Physics: Projectile Motion',
    messages: [
      {
        _id: 'msg1',
        role: 'user',
        content: 'Can you explain how to calculate the maximum height of a projectile if I know the initial velocity and launch angle?',
        inputMode: 'text'
      },
      {
        _id: 'msg2',
        role: 'assistant',
        content: 'Absolutely. Calculating the maximum height of a projectile is a classic kinematics problem.\n\n### The Formula\nThe maximum height ($H$) can be found using this formula:\n```text\nH = (v₀² * sin²(θ)) / (2 * g)\n```\n### Variables Explained:\n* **v₀** = Initial velocity (magnitude)\n* **θ** = Launch angle relative to the horizontal\n* **g** = Acceleration due to gravity (approx. 9.8 m/s²)\n\nDo you have specific numbers you\'d like to plug into this formula?',
        inputMode: 'text'
      }
    ]
  });
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const askText = async (chatId, question, subject) => {
    // Dummy UI implementation
    setSendingMessage(true);
    const newMsg = { _id: Date.now().toString(), role: 'user', content: question, inputMode: 'text' };
    setActiveChat(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
    
    setTimeout(() => {
      const aiMsg = { _id: (Date.now() + 1).toString(), role: 'assistant', content: 'This is a mock AI response.', inputMode: 'text' };
      setActiveChat(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
      setSendingMessage(false);
    }, 1500);
  };

  const askImage = async (chatId, imageFile, question, subject) => {
    setSendingMessage(true);
    const imageUrl = URL.createObjectURL(imageFile);
    const newMsg = { _id: Date.now().toString(), role: 'user', content: question, imageUrl, inputMode: 'image' };
    setActiveChat(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
    
    setTimeout(() => {
      const aiMsg = { _id: (Date.now() + 1).toString(), role: 'assistant', content: 'I analyzed the image.', inputMode: 'text' };
      setActiveChat(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
      setSendingMessage(false);
    }, 1500);
  };

  const askVoice = async (chatId, audioBlob, subject) => {
    setSendingMessage(true);
    const audioUrl = URL.createObjectURL(audioBlob);
    const newMsg = { _id: Date.now().toString(), role: 'user', content: 'Audio Doubt', audioUrl, inputMode: 'voice' };
    setActiveChat(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
    
    setTimeout(() => {
      const aiMsg = { _id: (Date.now() + 1).toString(), role: 'assistant', content: 'I heard you!', inputMode: 'text' };
      setActiveChat(prev => ({ ...prev, messages: [...prev.messages, aiMsg] }));
      setSendingMessage(false);
    }, 1500);
  };

  return (
    <ChatContext.Provider value={{
      chats, activeChat, setActiveChat, loadingChats, sendingMessage,
      askText, askImage, askVoice
    }}>
      {children}
    </ChatContext.Provider>
  );
};
