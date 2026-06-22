import api from './api';

export const getAllDoubts = async () => {
  const response = await api.get('/doubts');
  return response.data;
};

export const getDoubtById = async (id) => {
  const response = await api.get(`/doubts/${id}`);
  return response.data;
};

export const createDoubt = async () => {
  const response = await api.post('/doubts');
  return response.data;
};

export const deleteDoubt = async (id) => {
  const response = await api.delete(`/doubts/${id}`);
  return response.data;
};

export const getDoubtStats = async () => {
  const response = await api.get('/doubts/stats');
  return response.data;
};

export const askText = async (chatId, question, subject) => {
  const response = await api.post(`/doubts/${chatId}/text`, { question, subject });
  return response.data;
};

export const askImage = async (chatId, imageFile, question, subject) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  if (question) formData.append('question', question);
  if (subject) formData.append('subject', subject);
  
  const response = await api.post(`/doubts/${chatId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000
  });
  return response.data;
};

export const askVoice = async (chatId, audioBlob, subject) => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice_doubt.webm');
  if (subject) formData.append('subject', subject);
  
  const response = await api.post(`/doubts/${chatId}/voice`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000
  });
  return response.data;
};
