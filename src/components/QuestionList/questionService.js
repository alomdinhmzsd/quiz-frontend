import axios from 'axios';

// Add debug log at the top of both files:
console.log('API Base URL:', process.env.REACT_APP_API_URL);

export const fetchQuestions = async () => {
  const response = await axios.get(
    `${process.env.REACT_APP_API_URL}/api/questions`
  );
  return response.data.data || [];
};
