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
  IconButton,
  Chip,
  Link,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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
        setSelected('');
        setSubmitted(false);
        setIsCorrect(false);

        const [allQuestionsRes, questionRes] = await Promise.all([
          axios.get('/api/questions'),
          axios.get(`/api/questions/${id}`),
        ]);

        if (!questionRes.data) throw new Error('Question not found');

        const allQuestions = allQuestionsRes.data;
        const currentIndex = allQuestions.findIndex((q) => q._id === id);
        if (currentIndex === -1) throw new Error('Question not in list');

        setTotalQuestions(allQuestions.length);
        setQuestionNumber(currentIndex + 1);
        setProgress(((currentIndex + 1) / allQuestions.length) * 100);

        setQuestion({
          ...questionRes.data,
          answers: questionRes.data.answers.map((a) => ({
            ...a,
            _id: a._id.toString(),
          })),
        });

        // Load saved answer if exists
        const savedAnswers = JSON.parse(
          localStorage.getItem('quizAnswers') || '{}'
        );
        if (savedAnswers[id]) {
          setSelected(savedAnswers[id].selected);
          setSubmitted(savedAnswers[id].submitted);
          setIsCorrect(savedAnswers[id].isCorrect);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || err.message);
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = () => {
    if (!question) return;

    const correctAnswer = question.answers.find((a) => a.isCorrect);
    const correct = selected === correctAnswer?._id;
    setIsCorrect(correct);
    setSubmitted(true);

    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    savedAnswers[id] = { selected, submitted: true, isCorrect: correct };
    localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));
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
      console.error('Error:', err);
      setError('Failed to load next question');
    }
  };

  const resetQuestion = () => {
    setSelected('');
    setSubmitted(false);
    setIsCorrect(false);

    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    delete savedAnswers[id];
    localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));
  };

  const resetAllAnswers = () => {
    localStorage.removeItem('quizAnswers');
    window.location.reload();
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
      {/* Progress bar and reset button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ width: '80%' }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Question {questionNumber} of {totalQuestions}
          </Typography>
          <LinearProgress
            variant='determinate'
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        <IconButton
          onClick={resetAllAnswers}
          title='Reset all answers'
          color='error'>
          <RestartAltIcon />
        </IconButton>
      </Box>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}>
        Back to Questions
      </Button>

      {/* Question - Safely accessed after null check */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant='h6'
          gutterBottom
          sx={{
            fontWeight: 500,
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
            mb: 2,
            fontSize: '1.1rem',
          }}>
          {question?.questionId}: {question?.question}
          <Chip
            label={question.domain}
            size='small'
            sx={{ ml: 2, verticalAlign: 'middle' }}
          />
        </Typography>

        {/* Display image if exists */}
        {question.image && (
          <Box
            component='img'
            src={`/images/${question.image}`}
            alt='Question illustration'
            sx={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              mb: 3,
              borderRadius: 1,
              boxShadow: 1,
            }}
          />
        )}

        {/* Display reference if exists */}
        {question.reference && (
          <Box sx={{ mb: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              Reference:{' '}
              <Link
                href={question.reference}
                target='_blank'
                rel='noopener noreferrer'
                sx={{ color: 'primary.main' }}>
                {question.reference}
              </Link>
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Answers */}
        {question?.answers?.map((answer) => (
          <Paper
            key={answer._id}
            sx={{
              p: 2,
              mb: 2,
              backgroundColor: submitted
                ? answer.isCorrect
                  ? 'rgba(46, 125, 50, 0.3)'
                  : selected === answer._id
                  ? 'rgba(211, 47, 47, 0.3)'
                  : 'background.paper'
                : 'background.paper',
              border:
                submitted && answer.isCorrect
                  ? '2px solid #2e7d32'
                  : '1px solid rgba(255, 255, 255, 0.12)',
              cursor: !submitted ? 'pointer' : 'default',
              '&:hover': {
                backgroundColor: !submitted
                  ? 'rgba(255, 255, 255, 0.08)'
                  : undefined,
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
                    fontSize: '0.95rem',
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
                  fontSize: '0.9rem',
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
          gap: 2,
        }}>
        {!submitted ? (
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={!selected}
            sx={{ flex: 1 }}>
            Submit Answer
          </Button>
        ) : (
          <>
            <Button variant='outlined' onClick={resetQuestion} sx={{ flex: 1 }}>
              Try Again
            </Button>
            <Button
              variant='contained'
              endIcon={<NavigateNextIcon />}
              onClick={handleNextQuestion}
              sx={{ flex: 1 }}>
              Next Question
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
