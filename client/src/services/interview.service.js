import API from './api.js';

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await API.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
};

export const startInterview = async (role, difficulty, resumeText, totalQuestions = 5) => {
  const response = await API.post('/interview/start', {
    role,
    difficulty,
    resumeText,
    totalQuestions,
  });
  return response.data.data;
};

export const getInterview = async (id) => {
  const response = await API.get(`/interview/${id}`);
  return response.data.data;
};

export const submitTextAnswer = async (id, answer) => {
  const response = await API.post(`/interview/${id}/answer`, { answer });
  return response.data.data;
};

export const getAllInterviews = async () => {
  const response = await API.get('/interview');
  return response.data.data;
};

export const getFeedback = async (id) => {
  const response = await API.get(`/interview/${id}/feedback`);
  return response.data.data;
};

export const deleteInterview = async (id) => {
  const response = await API.delete(`/interview/${id}`);
  return response.data;
};
