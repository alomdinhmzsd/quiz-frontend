import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Radio,
  FormControlLabel,
  Box,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export default function QuestionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [progress, setProgress] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all questions to calculate progress
        const allQuestionsRes = await axios.get('/api/questions');
        const allQuestions = allQuestionsRes.data;
        setTotalQuestions(allQuestions.length);

        // Find current question index
        const currentIndex = allQuestions.findIndex((q) => q._id === id);
        if (currentIndex === -1) {
          throw new Error('Question not found in list');
        }
        setQuestionNumber(currentIndex + 1);
        setProgress(((currentIndex + 1) / allQuestions.length) * 100);

        // Fetch current question details
        const questionRes = await axios.get(`/api/questions/${id}`);
        if (!questionRes.data) throw new Error('Empty response');

        setQuestion({
          ...questionRes.data,
          answers: questionRes.data.answers.map((a) => ({
            ...a,
            _id: a._id.toString(),
          })),
        });
      } catch (err) {
        console.error('Error fetching question:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = () => {
    const correctAnswer = question.answers.find((a) => a.isCorrect);
    setIsCorrect(selected === correctAnswer._id);
    setSubmitted(true);
  };

  const handleNextQuestion = async () => {
    try {
      const res = await axios.get('/api/questions');
      const currentIndex = res.data.findIndex((q) => q._id === id);
      if (currentIndex < res.data.length - 1) {
        navigate(`/questions/${res.data[currentIndex + 1]._id}`);
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Error fetching next question:', err);
      setError('Failed to load next question');
    }
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !question) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          {error || 'Question not found'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant='contained'>
          Back to Questions
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Progress bar */}
      <Box sx={{ width: '100%', mb: 3 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          Question {questionNumber} of {totalQuestions}
        </Typography>
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}>
        Back to Questions
      </Button>

      {/* Question */}
      <Paper sx={{ p: 3, mb: 3, backgroundColor: 'background.paper' }}>
        <Typography
          variant='h5'
          gutterBottom
          sx={{
            fontWeight: 500,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            mb: 3,
          }}>
          {question.questionId}: {question.question}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* Answers */}
        {question.answers.map((answer) => (
          <Paper
            key={answer._id}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: submitted
                ? answer.isCorrect
                  ? 'rgba(46, 125, 50, 0.3)' // More visible green
                  : selected === answer._id
                  ? 'rgba(211, 47, 47, 0.3)' // More visible red
                  : 'background.paper'
                : 'background.paper',
              border:
                submitted && answer.isCorrect
                  ? '2px solid #2e7d32'
                  : '1px solid rgba(255, 255, 255, 0.12)',
              cursor: submitted ? 'default' : 'pointer',
              '&:hover': {
                backgroundColor: submitted
                  ? undefined
                  : 'rgba(255, 255, 255, 0.08)',
              },
            }}
            onClick={() => !submitted && setSelected(answer._id)}>
            <FormControlLabel
              control={
                <Radio
                  checked={selected === answer._id}
                  disabled={submitted}
                  sx={{
                    color:
                      submitted && answer.isCorrect ? '#2e7d32' : undefined,
                  }}
                />
              }
              label={
                <Typography
                  sx={{
                    fontWeight: submitted && answer.isCorrect ? 600 : 400,
                    color:
                      submitted && answer.isCorrect
                        ? '#2e7d32'
                        : 'text.primary',
                  }}>
                  {answer.text}
                </Typography>
              }
              sx={{ width: '100%' }}
            />

            {submitted && (
              <Typography
                variant='body2'
                sx={{
                  mt: 1,
                  color: answer.isCorrect ? 'success.main' : 'error.main',
                  fontStyle: 'italic',
                }}>
                {answer.explanation}
              </Typography>
            )}
          </Paper>
        ))}
      </Paper>

      {/* Action buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3,
        }}>
        {!submitted ? (
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!selected}
            sx={{ minWidth: 120 }}>
            Submit
          </Button>
        ) : (
          <Alert
            severity={isCorrect ? 'success' : 'error'}
            sx={{ flexGrow: 1, mr: 2 }}>
            {isCorrect ? 'Correct!' : 'Incorrect - Please try again'}
          </Alert>
        )}

        {submitted && (
          <Button
            variant='contained'
            endIcon={<NavigateNextIcon />}
            onClick={handleNextQuestion}
            sx={{ minWidth: 120 }}>
            Next
          </Button>
        )}
      </Box>
    </Container>
  );
}
