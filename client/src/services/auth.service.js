import API from './api.js';

export const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await API.post('/auth/login', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateGoals = async (goals) => {
  const response = await API.put('/auth/goals', goals);
  return response.data;
};
