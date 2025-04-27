import axios from 'axios';

/**
 * Fetches all questions from the API
 * @async
 * @returns {Promise<Array>} Array of question objects
 * @throws {Error} If API request fails
 */
export const fetchQuestions = async () => {
  try {
    console.log('API Base URL:', process.env.REACT_APP_API_URL);
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/questions`
    );
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw new Error('Failed to load questions. Please try again later.');
  }
};
