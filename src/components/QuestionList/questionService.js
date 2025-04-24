import axios from 'axios';

export const fetchQuestions = async () => {
  const response = await axios.get('/api/questions');
  return response.data.data || [];
};
