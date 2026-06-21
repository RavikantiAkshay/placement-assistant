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
