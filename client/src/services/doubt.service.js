import API from './api';

export const createOrUpdateDoubt = (data) => {
  // data could be FormData for files or JSON for text
  return API.post('/doubts', data);
};

export const fetchDoubts = () => {
  return API.get('/doubts');
};

export const fetchDoubtById = (id) => {
  return API.get(`/doubts/${id}`);
};
