import axios from 'axios';

/**
 * Fetches all questions from the backend
 *
 * @async
 * @returns {Promise<Array>} Array of question objects
 * @throws {Error} If request fails
 */
export const fetchQuestions = async () => {
  try {
    console.log('API Base URL:', import.meta.env.VITE_APP_API_URL);

    // Make API call to get all questions
    const response = await axios.get(
      `${import.meta.env.VITE_APP_API_URL}/api/questions`
    );

    // Return the data or empty array
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw new Error('Failed to load questions. Please try again later.');
  }
};
