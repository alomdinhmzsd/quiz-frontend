import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, CircularProgress, Alert, Button } from '@mui/material';
import { useQuestionData } from './hooks/useQuestionData';
import { useQuestionUI } from './hooks/useQuestionUI';
import { handleSubmit, resetQuestion } from './utils/answerHandlers';
import ProgressSection from './ProgressSection';
import ResetDialog from './ResetDialog';
import BackButton from './BackButton';
import QuestionHeader from './QuestionHeader';
import ActionButtons from './ActionButtons';
import AnswerItem from './AnswerItem';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * Normalize text values for duplicate detection.
 * Removes prefixes, underscores, and trims/lowers the case.
 * @param {string} text - Text value to normalize
 * @returns {string} - Cleaned normalized string
 */
const normalizeAnswerText = (text) =>
  text
    ?.replace(/^text-/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase() || '';

/**
 * Flag answers that are textual duplicates for display warnings.
 * @param {Array} answers - Array of answer objects
 * @returns {Array} - Array with `isDuplicate` and `normalizedText` fields
 */
const detectDuplicates = (answers) => {
  const contentMap = {};
  return (
    answers?.map((answer) => {
      const normalized = normalizeAnswerText(answer.text);
      const isDuplicate = contentMap[normalized];
      contentMap[normalized] = true;
      return { ...answer, isDuplicate, normalizedText: normalized };
    }) || []
  );
};

/**
 * Derives a unique key for rendering an answer.
 * @param {Object} answer - Answer object
 * @returns {string} - Unique ID for that answer
 */
const getAnswerId = (answer) =>
  answer?._id || answer?.id || `gen-${Math.random().toString(36).substr(2, 9)}`;

/**
 * Shuffles answers array using Fisher-Yates algorithm.
 * @param {Array} array - Answers array
 * @returns {Array} - Shuffled array
 */
const shuffleAnswers = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Main Question Detail Component.
 * Handles data fetch, state transitions, answer selection, and rendering.
 */
const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { question, loading, error, allQuestions } = useQuestionData(id);
  const {
    selected,
    setSelected,
    submitted,
    setSubmitted,
    isCorrect,
    setIsCorrect,
    showResetDialog,
    setShowResetDialog,
    showExplanation,
    setShowExplanation,
  } = useQuestionUI(question);

  const [displayedAnswers, setDisplayedAnswers] = useState([]);
  const [jumpToId, setJumpToId] = useState('');

  /**
   * Tracks question attempt history from localStorage
   * @type {Object|null}
   */
  const questionStats = useMemo(() => {
    try {
      const savedAnswers = JSON.parse(
        localStorage.getItem('quizAnswers') || '{}'
      );
      const answer = savedAnswers[id];
      if (!answer) return null;
      return {
        isCorrect: answer.isCorrect,
        lastAttempt: new Date(answer.timestamp).toLocaleString(),
      };
    } catch {
      return null;
    }
  }, [id]);

  /**
   * Reset state (answers, correctness) when question ID changes.
   */
  useEffect(() => {
    setSelected([]);
    setSubmitted(false);
    setIsCorrect(false);
  }, [id, setSelected, setSubmitted, setIsCorrect]);

  /**
   * Recompute displayedAnswers whenever the question or submission state changes.
   */
  useEffect(() => {
    if (question) {
      const processedAnswers = detectDuplicates(question.answers);
      const answersToDisplay = submitted
        ? processedAnswers
        : shuffleAnswers(processedAnswers);
      setDisplayedAnswers(answersToDisplay);
    }
  }, [question, submitted]);

  /**
   * Handle answer selection (radio or checkbox logic)
   * @param {string} answerId - Selected answer ID
   */
  const handleSelect = (answerId) => {
    if (question?.type === 'single') {
      setSelected([answerId]);
    } else {
      setSelected((prev) =>
        prev.includes(answerId)
          ? prev.filter((id) => id !== answerId)
          : [...prev, answerId]
      );
    }
  };

  /**
   * Validate submission, mark correctness and reveal explanations.
   */
  const handleSubmitAnswer = async () => {
    const result = await handleSubmit(
      question,
      selected,
      setIsCorrect,
      setSubmitted
    );
    if (result !== undefined) setIsCorrect(result);
    setSubmitted(true);
  };

  /**
   * Clear selected answers and feedback state.
   */
  const handleResetQuestion = () => {
    resetQuestion(setSelected, setSubmitted, setIsCorrect);
  };

  const questionNumber =
    allQuestions.findIndex(
      (q) => q._id === id || q.questionId?.toLowerCase() === id.toLowerCase()
    ) + 1;
  const progress = (questionNumber / allQuestions.length) * 100;

  if (loading) return <LoadingState />;
  if (error || !question)
    return <ErrorState error={error} navigate={navigate} />;

  // Suppress images and references until user submits answer
  const safeQuestion = {
    ...question,
    reference: submitted ? question.reference : null,
    image: submitted ? question.image : null,
  };

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <ProgressSection
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        progress={progress}
        submitted={submitted}
        setShowResetDialog={setShowResetDialog}
        checkAnswerSaved={(qId) => {
          try {
            const stored = JSON.parse(
              localStorage.getItem('quizAnswers') || '{}'
            );
            return !!stored[qId];
          } catch {
            return false;
          }
        }}
        questionStats={questionStats}
      />

      <ResetDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          try {
            localStorage.removeItem('quizAnswers');
          } catch (e) {
            console.warn('Failed to clear localStorage:', e);
          }
          window.location.reload();
        }}
      />

      <BackButton navigate={navigate} />

      <QuestionHeader
        question={safeQuestion}
        showExplanation={showExplanation}
        setShowExplanation={setShowExplanation}
        submitted={submitted}
        isCorrect={isCorrect}
      />

      {displayedAnswers.map((answer) => (
        <AnswerItem
          key={getAnswerId(answer)}
          answer={answer}
          questionType={question.type}
          selected={selected}
          submitted={submitted}
          handleAnswerSelect={handleSelect}
        />
      ))}

      <ActionButtons
        submitted={submitted}
        question={question}
        selected={selected}
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        handleSubmit={handleSubmitAnswer}
        resetQuestion={handleResetQuestion}
        jumpToId={jumpToId}
        setJumpToId={setJumpToId}
        navigateToQuestion={(offset) => {
          const currentIndex = allQuestions.findIndex((q) => q._id === id);
          if (currentIndex >= 0) {
            const newQuestion = allQuestions[currentIndex + offset];
            if (newQuestion) navigate(`/questions/${newQuestion._id}`);
          }
        }}
        handleJumpToQuestion={() => navigate(`/questions/${jumpToId}`)}
        handleKeyDown={(e) =>
          e.key === 'Enter' && navigate(`/questions/${jumpToId}`)
        }
      />
    </Container>
  );
};

/**
 * Display loading indicator while data is being fetched.
 */
const LoadingState = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minHeight='80vh'>
    <CircularProgress />
  </Box>
);

/**
 * Display error UI if question fails to load.
 * @param {Object} props - Component props
 * @param {Error|null} props.error - Error object
 * @param {function} props.navigate - Navigation function
 */
const ErrorState = ({ error, navigate }) => (
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

export default QuestionDetail;
