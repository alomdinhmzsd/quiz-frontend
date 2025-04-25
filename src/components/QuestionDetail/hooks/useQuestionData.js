import { useState, useEffect } from 'react';
import axios from 'axios';

export const useQuestionData = (id) => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [allQuestionsRes, questionRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/questions`),
          axios
            .get(`${process.env.REACT_APP_API_URL}/api/questions/${id}`)
            .catch(async () => {
              return axios.get(
                `${process.env.REACT_APP_API_URL}/api/questions/${id}`,
                {
                  params: { questionId: id },
                }
              );
            }),
        ]);

        setAllQuestions(allQuestionsRes.data.data || []);
        setQuestion(questionRes.data.data);
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
