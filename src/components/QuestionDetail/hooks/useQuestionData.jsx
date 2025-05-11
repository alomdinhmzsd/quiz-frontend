import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom React hook to:
 * - Fetch all questions from the backend
 * - Fetch a specific question by ID (with fallback retry)
 * - Return state for question, loading, error, and full question list
 */
export const useQuestionData = (id) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    /**
     * Fetches:
     * - All questions list
     * - One specific question by ID (with retry fallback on failure)
     * - Saves specific question into browser Cache Storage for offline use
     */
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Parallel API requests
        const [allQuestionsRes, questionRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_APP_API_URL}/api/questions`),

          axios
            .get(`${import.meta.env.VITE_APP_API_URL}/api/questions/${id}`)
            .catch(async () => {
              return axios.get(
                `${import.meta.env.VITE_APP_API_URL}/api/questions/${id}`,
                { params: { questionId: id } }
              );
            }),
        ]);

        // Update React state
        setAllQuestions(allQuestionsRes.data.data || []);
        setQuestion(questionRes.data.data);

        // ✅ Dynamically store the question in Cache Storage for offline use
        if ('caches' in window) {
          const cache = await caches.open('quiz-app-dynamic');
          const responseClone = new Response(JSON.stringify(questionRes.data));
          await cache.put(
            `${import.meta.env.VITE_APP_API_URL}/api/questions/${id}`,
            responseClone
          );
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  return { question, loading, error, allQuestions };
};

// Debug log
console.log('API Base URL:', import.meta.env.VITE_APP_API_URL);
