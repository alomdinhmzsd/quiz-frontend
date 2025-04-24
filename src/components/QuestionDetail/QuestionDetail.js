import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useQuestionData } from './hooks/useQuestionData';
import { useQuestionUI } from './hooks/useQuestionUI';
import {
  handleAnswerSelect,
  handleSubmit,
  resetQuestion,
} from './utils/answerHandlers';
import ProgressSection from './ProgressSection';
import ResetDialog from './ResetDialog';
import BackButton from './BackButton';
import QuestionHeader from './QuestionHeader';
import ActionButtons from './ActionButtons';
import AnswerItem from './AnswerItem';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data hooks
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

  // Calculate progress
  const questionNumber =
    allQuestions.findIndex(
      (q) => q._id === id || q.questionId?.toLowerCase() === id.toLowerCase()
    ) + 1;
  const progress = (questionNumber / allQuestions.length) * 100;

  const checkAnswerSaved = (questionId) => {
    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    return !!savedAnswers[questionId];
  };

  // Enhanced answer handlers with debugging
  const answerHandlers = {
    handleSelect: (answerId) => {
      console.log('Attempting to select:', answerId);
      return handleAnswerSelect(
        answerId,
        question?.type,
        selected,
        setSelected,
        submitted
      );
    },
    handleSubmit: () => {
      console.log('Submitting answers:', selected);
      return handleSubmit(question, selected, setIsCorrect, setSubmitted);
    },
    resetQuestion: () => {
      console.log('Resetting question');
      return resetQuestion(question, setSelected, setSubmitted, setIsCorrect);
    },
  };

  const handleNavigationError = (error) => {
    console.error('Navigation error:', error);
  };

  const navHandlers = {
    navigateTo: (offset) => {
      try {
        const currentIndex = allQuestions.findIndex(
          (q) =>
            q._id === id ||
            (q.questionId && q.questionId.toLowerCase() === id.toLowerCase())
        );
        if (currentIndex >= 0) {
          const newIndex = currentIndex + offset;
          if (newIndex >= 0 && newIndex < allQuestions.length) {
            navigate(`/questions/${allQuestions[newIndex]._id}`);
          }
        }
      } catch (err) {
        handleNavigationError(err);
      }
    },
    jumpToQuestion: (jumpId) => {
      try {
        if (!jumpId?.trim()) return;

        const foundQuestion = allQuestions.find(
          (q) =>
            q.questionId &&
            q.questionId.toLowerCase() === jumpId.toLowerCase().trim()
        );
        if (foundQuestion) {
          navigate(`/questions/${foundQuestion._id}`);
        }
      } catch (err) {
        handleNavigationError(err);
      }
    },
  };

  if (loading) return <LoadingState />;
  if (error || !question)
    return <ErrorState error={error} navigate={navigate} />;

  // Enhanced debugging
  console.log('--- DEBUG ---');
  console.log('Question:', question?.questionId);
  console.log(
    'Answers:',
    question?.answers?.map((a) => ({
      id: a._id,
      text: a.text?.substring(0, 50) + (a.text?.length > 50 ? '...' : ''),
    }))
  );
  console.log('Selected:', selected);
  console.log('Question Type:', question?.type);
  console.log('Submitted:', submitted);
  console.log('--- END DEBUG ---');

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <ProgressSection
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        progress={progress}
        submitted={submitted}
        setShowResetDialog={setShowResetDialog}
        checkAnswerSaved={checkAnswerSaved}
      />

      <ResetDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          localStorage.removeItem('quizAnswers');
          window.location.reload();
        }}
      />

      <BackButton navigate={navigate} />

      <QuestionHeader
        question={question}
        showExplanation={showExplanation}
        setShowExplanation={setShowExplanation}
        submitted={submitted}
        isCorrect={isCorrect}
      />

      {question.answers?.map((answer) => (
        <AnswerItem
          key={answer._id || Math.random().toString()}
          answer={answer}
          questionType={question.type}
          selected={selected}
          submitted={submitted}
          handleAnswerSelect={answerHandlers.handleSelect}
        />
      ))}

      <ActionButtons
        submitted={submitted}
        question={question}
        selected={selected}
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        handleSubmit={answerHandlers.handleSubmit}
        resetQuestion={answerHandlers.resetQuestion}
        navigateToQuestion={navHandlers.navigateTo}
        handleJumpToQuestion={navHandlers.jumpToQuestion}
      />
    </Container>
  );
};

const LoadingState = () => (
  <Box
    display='flex'
    justifyContent='center'
    alignItems='center'
    minHeight='80vh'>
    <CircularProgress />
  </Box>
);

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
