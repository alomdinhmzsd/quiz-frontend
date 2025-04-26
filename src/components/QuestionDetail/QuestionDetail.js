import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '@mui/material';
import { useQuestionData } from './hooks/useQuestionData';
import { useQuestionUI } from './hooks/useQuestionUI';
import { handleSubmit, resetQuestion } from './utils/answerHandlers';
import ProgressSection from './ProgressSection';
import ResetDialog from './ResetDialog';
import BackButton from './BackButton';
import QuestionHeader from './QuestionHeader';
import ActionButtons from './ActionButtons';
import AnswerItem from './AnswerItem';
import { Box, CircularProgress, Alert, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// ==================== NEW UTILITIES ====================
const normalizeAnswerText = (text) => {
  if (!text) return '';
  return text
    .replace(/^text-/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
};

const detectDuplicates = (answers) => {
  const contentMap = {};
  return (
    answers?.map((answer) => {
      const normalized = normalizeAnswerText(answer.text);
      const isDuplicate = contentMap[normalized];
      contentMap[normalized] = true;
      return {
        ...answer,
        isDuplicate,
        normalizedText: normalized, // For consistent comparison
      };
    }) || []
  );
};

const getAnswerId = (answer) => {
  return (
    answer?._id ||
    answer?.id ||
    `gen-${Math.random().toString(36).substr(2, 9)}`
  );
};
// ==================== END UTILITIES ====================

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

  // ==================== FIXED EFFECTS ====================
  useEffect(() => {
    if (question) {
      const processedAnswers = detectDuplicates(question.answers);
      console.log('Processed answers:', processedAnswers);
      setSelected([]);
      setSubmitted(false);
      setIsCorrect(false);
    }
  }, [id, question, setSelected, setSubmitted, setIsCorrect]);

  // ==================== ENHANCED HANDLERS ====================
  const answerHandlers = {
    handleSelect: (answerId) => {
      const normalizedId = normalizeAnswerText(answerId);
      console.log('Selection event:', {
        answerId,
        normalizedId,
        currentSelected: selected,
      });

      if (question?.type === 'single') {
        setSelected([answerId]);
      } else {
        setSelected((prev) =>
          prev.includes(answerId)
            ? prev.filter((id) => id !== answerId)
            : [...prev, answerId]
        );
      }
    },

    handleSubmit: async () => {
      console.log('--- Starting Submission ---');
      const isCorrect = await handleSubmit(
        question,
        selected,
        setIsCorrect,
        setSubmitted
      );

      // Additional debug
      console.log('Post-Submission State:', {
        isCorrect,
        selectedAnswers: selected,
        questionId: question._id,
        localStorage: JSON.parse(localStorage.getItem('quizAnswers') || '{}'),
      });

      // Force UI update if needed
      if (isCorrect !== undefined) {
        setIsCorrect(isCorrect);
      }
      setSubmitted(true);
    },

    resetQuestion: () => {
      resetQuestion(question, setSelected, setSubmitted, setIsCorrect);
    },
  };

  // ==================== RENDER LOGIC ====================
  if (loading) return <LoadingState />;
  if (error || !question)
    return <ErrorState error={error} navigate={navigate} />;

  // Progress calculation
  const questionNumber =
    allQuestions.findIndex(
      (q) => q._id === id || q.questionId?.toLowerCase() === id.toLowerCase()
    ) + 1;
  const progress = (questionNumber / allQuestions.length) * 100;

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <ProgressSection
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        progress={progress}
        submitted={submitted}
        setShowResetDialog={setShowResetDialog}
        checkAnswerSaved={(qId) => !!localStorage.getItem('quizAnswers')?.[qId]}
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

      {/* Answers List with Duplicate Protection */}
      {detectDuplicates(question.answers).map((answer) => (
        <AnswerItem
          key={getAnswerId(answer)}
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
        navigateToQuestion={(offset) => {
          const currentIndex = allQuestions.findIndex((q) => q._id === id);
          if (currentIndex >= 0) {
            const newQuestion = allQuestions[currentIndex + offset];
            if (newQuestion) navigate(`/questions/${newQuestion._id}`);
          }
        }}
        handleJumpToQuestion={(jumpId) => {
          const target = allQuestions.find(
            (q) => q.questionId?.toLowerCase() === jumpId.toLowerCase()
          );
          if (target) navigate(`/questions/${target._id}`);
        }}
      />
    </Container>
  );
};

// ==================== KEEP EXISTING SUB-COMPONENTS ====================
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
