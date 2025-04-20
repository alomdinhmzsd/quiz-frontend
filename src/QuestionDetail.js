import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Button,
  Radio,
  Checkbox,
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
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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
  const [allQuestions, setAllQuestions] = useState([]);
  const [jumpToId, setJumpToId] = useState('');
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Add this new function to verify localStorage
  const checkAnswerSaved = () => {
    const savedAnswers = JSON.parse(localStorage.getItem('quizAnswers') || {});
    return savedAnswers[question?._id] || null;
  };

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
          axios.get(`/api/questions/${id}`).catch(async () => {
            // If not found by _id, try by questionId
            return axios.get(`/api/questions/${id}`, {
              params: { questionId: id },
            });
          }),
        ]);

        console.log('Question detail response:', questionRes.data.data);
        console.log('Reference exists:', !!questionRes.data.data.reference);
        console.log('Reference value:', questionRes.data.data.reference);

        if (!questionRes?.data?.data) throw new Error('Question not found');

        const questions = allQuestionsRes.data.data || [];
        const currentIndex = questions.findIndex(
          (q) => q._id === id || q.questionId.toLowerCase() === id.toLowerCase()
        );

        if (currentIndex === -1) throw new Error('Question not in list');

        setAllQuestions(questions);
        setTotalQuestions(questions.length);
        setQuestionNumber(currentIndex + 1);
        setProgress(((currentIndex + 1) / questions.length) * 100);

        setQuestion(questionRes.data.data);

        // Load saved answer if exists
        const savedAnswers = JSON.parse(
          localStorage.getItem('quizAnswers') || '{}'
        );
        const questionKey = questionRes.data.data._id;
        if (savedAnswers[questionKey]) {
          setSelected(savedAnswers[questionKey].selected);
          setSubmitted(savedAnswers[questionKey].submitted);
          setIsCorrect(savedAnswers[questionKey].isCorrect);
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
    const correct =
      question.type === 'single'
        ? selected === correctAnswer?._id
        : JSON.stringify(selected.sort()) ===
          JSON.stringify(
            question.answers
              .filter((a) => a.isCorrect)
              .map((a) => a._id)
              .sort()
          );

    setIsCorrect(correct);
    setSubmitted(true);

    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    savedAnswers[question._id] = {
      selected,
      submitted: true,
      isCorrect: correct,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));
  };

  const handleAnswerSelect = (answerId) => {
    if (submitted) return;

    if (question.type === 'single') {
      setSelected(answerId);
    } else {
      setSelected((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId]
      );
    }
  };

  const navigateToQuestion = (offset) => {
    const currentIndex = allQuestions.findIndex(
      (q) => q._id === id || q.questionId.toLowerCase() === id.toLowerCase()
    );
    if (currentIndex >= 0) {
      const newIndex = currentIndex + offset;
      if (newIndex >= 0 && newIndex < allQuestions.length) {
        navigate(`/questions/${allQuestions[newIndex]._id}`);
      }
    }
  };

  const handleJumpToQuestion = () => {
    if (!jumpToId) return;

    // Try to find by questionId first
    const foundQuestion = allQuestions.find(
      (q) => q.questionId.toLowerCase() === jumpToId.toLowerCase().trim()
    );

    if (foundQuestion) {
      navigate(`/questions/${foundQuestion._id}`);
      setJumpToId('');
    } else {
      setError(`Question with ID ${jumpToId} not found`);
      setTimeout(() => setError(null), 3000);
    }
  };

  const resetQuestion = () => {
    setSelected('');
    setSubmitted(false);
    setIsCorrect(false);

    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    delete savedAnswers[question._id];
    localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));
  };

  const resetAllAnswers = () => {
    localStorage.removeItem('quizAnswers');
    window.location.reload();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && jumpToId) {
      handleJumpToQuestion();
    }
    // Arrow key navigation
    if (e.key === 'ArrowLeft') {
      navigateToQuestion(-1);
    } else if (e.key === 'ArrowRight') {
      navigateToQuestion(1);
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
          {/* Add the localStorage status indicator */}
          <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
            {checkAnswerSaved() ? (
              <>
                {submitted ? 'Answer saved' : 'Previous answer available'} -{' '}
                {new Date(checkAnswerSaved().timestamp).toLocaleString()}
              </>
            ) : (
              'Answer not yet saved'
            )}
          </Typography>
        </Box>
        <Tooltip title='Reset all progress'>
          <IconButton onClick={() => setShowResetDialog(true)} color='error'>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Reset confirmation dialog */}
      <Dialog open={showResetDialog} onClose={() => setShowResetDialog(false)}>
        <DialogTitle>Reset All Progress?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all your saved answers and progress. This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResetDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              resetAllAnswers();
              setShowResetDialog(false);
            }}
            color='error'
            variant='contained'>
            Reset All
          </Button>
        </DialogActions>
      </Dialog>

      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/')}
        sx={{ mb: 3 }}>
        Back to Questions
      </Button>

      {/* Question header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography
            variant='h6'
            gutterBottom
            sx={{
              fontWeight: 500,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              flexGrow: 1,
              fontSize: '1.1rem',
            }}>
            {question.questionId}: {question.question}
          </Typography>
          {question.explanation && (
            <Tooltip title='Show explanation'>
              <IconButton
                onClick={() => setShowExplanation(!showExplanation)}
                color={showExplanation ? 'primary' : 'default'}>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
          <Chip label={question.domain} size='small' />
          <Chip
            label={
              question.type === 'single' ? 'Single answer' : 'Multiple answers'
            }
            size='small'
            color='secondary'
          />
          {submitted && (
            <Chip
              label={isCorrect ? 'Correct' : 'Incorrect'}
              size='small'
              color={isCorrect ? 'success' : 'error'}
            />
          )}
        </Stack>

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
        {/* Enhanced Reference Section */}

        {question.reference && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
              borderRadius: 1,
            }}>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
              <strong>References:</strong>
            </Typography>
            {question.reference.split('\n\n').map((url, index) => (
              <Box key={index} sx={{ mb: 2 }}>
                <Link
                  href={url.trim()}
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{
                    color: 'primary.main',
                    wordBreak: 'break-all',
                    display: 'block',
                    '&:hover': { textDecoration: 'underline' },
                  }}>
                  {url.trim()}
                </Link>
                {url.includes('aws.amazon.com') && (
                  <Typography
                    variant='caption'
                    sx={{ color: 'text.secondary' }}>
                    (Official AWS Documentation)
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
        {showExplanation && question.explanation && (
          <Alert severity='info' sx={{ mb: 2 }}>
            <Typography variant='body2'>{question.explanation}</Typography>
          </Alert>
        )}

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
                  ? 'rgba(46, 125, 50, 0.3)'
                  : (
                      question.type === 'single'
                        ? selected === answer._id
                        : selected.includes(answer._id)
                    )
                  ? 'rgba(211, 47, 47, 0.3)'
                  : 'background.paper'
                : (
                    question.type === 'single'
                      ? selected === answer._id
                      : selected.includes(answer._id)
                  )
                ? 'rgba(25, 118, 210, 0.2)'
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
            onClick={() => !submitted && handleAnswerSelect(answer._id)}>
            <FormControlLabel
              control={
                question.type === 'single' ? (
                  <Radio
                    checked={selected === answer._id}
                    disabled={submitted}
                    sx={{
                      color:
                        submitted && answer.isCorrect ? '#2e7d32' : undefined,
                    }}
                  />
                ) : (
                  <Checkbox
                    checked={selected.includes(answer._id)}
                    disabled={submitted}
                    sx={{
                      color:
                        submitted && answer.isCorrect ? '#2e7d32' : undefined,
                    }}
                  />
                )
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

            {submitted && answer.explanation && (
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
          <>
            <Button
              variant='outlined'
              startIcon={<NavigateBeforeIcon />}
              onClick={() => navigateToQuestion(-1)}
              disabled={questionNumber <= 1}
              sx={{ minWidth: '120px' }}>
              Previous
            </Button>
            <Button
              variant='contained'
              onClick={handleSubmit}
              disabled={
                question.type === 'single' ? !selected : selected.length === 0
              }
              sx={{ flex: 1 }}>
              Submit Answer
            </Button>
            <Button
              variant='outlined'
              endIcon={<NavigateNextIcon />}
              onClick={() => navigateToQuestion(1)}
              disabled={questionNumber >= totalQuestions}
              sx={{ minWidth: '120px' }}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button
              variant='outlined'
              onClick={resetQuestion}
              sx={{ minWidth: '120px' }}>
              Try Again
            </Button>
            <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
              <TextField
                size='small'
                placeholder='Jump to ID (saa-Q001)'
                value={jumpToId}
                onChange={(e) => setJumpToId(e.target.value)}
                onKeyDown={handleKeyDown}
                sx={{ flex: 1 }}
              />
              <Button
                variant='contained'
                onClick={handleJumpToQuestion}
                disabled={!jumpToId}>
                Go
              </Button>
            </Box>
            <Button
              variant='contained'
              endIcon={<NavigateNextIcon />}
              onClick={() => navigateToQuestion(1)}
              disabled={questionNumber >= totalQuestions}
              sx={{ minWidth: '120px' }}>
              Next Question
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
}
