import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom hook for fetching question data from API
 * @param {string} id - The ID of the question to fetch
 * @returns {object} Contains:
 *   - question: Current question data
 *   - loading: Loading state
 *   - error: Error message if request fails
 *   - allQuestions: Array of all questions
 */
export const useQuestionData = (id) => {
  // State management for question data
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    /**
     * Fetches question data from API
     * - Gets both the specific question and all questions list
     * - Handles errors gracefully
     */
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel API requests for better performance
        const [allQuestionsRes, questionRes] = await Promise.all([
          // Fetch all questions
          axios.get(`${process.env.REACT_APP_API_URL}/questions`),

          // Fetch specific question with fallback retry
          axios
            .get(`${process.env.REACT_APP_API_URL}/questions/${id}`)
            .catch(async () => {
              // Retry with questionId param if initial request fails
              return axios.get(
                `${process.env.REACT_APP_API_URL}/questions/${id}`,
                { params: { questionId: id } }
              );
            }),
        ]);

        // Update state with fetched data
        setAllQuestions(allQuestionsRes.data.data || []);
        setQuestion(questionRes.data.data);
      } catch (err) {
        // Capture either API error message or generic error
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Re-run effect when question ID changes

  return { question, loading, error, allQuestions };
};

// Debug log for API configuration
console.log('API Base URL:', process.env.REACT_APP_API_URL);
