import axios from 'axios';

export const fetchQuestions = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/questions`
  );
  return response.data.data || [];
};
