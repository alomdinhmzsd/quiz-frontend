/**
 * QuestionDetail.js
 *
 * The main component for displaying and interacting with a single question.
 * Handles:
 * - Loading and displaying question data
 * - Answer selection and submission
 * - Navigation between questions
 * - Progress tracking
 * - State management for the question UI
 *
 * Uses custom hooks for data fetching and UI state management.
 */

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

// ==================== UTILITY FUNCTIONS ====================

/**
 * Normalizes answer text for consistent comparison:
 * - Removes 'text-' prefix if present
 * - Replaces underscores with spaces
 * - Trims whitespace
 * - Converts to lowercase
 * @param {string} text - The answer text to normalize
 * @returns {string} Normalized text
 */
const normalizeAnswerText = (text) => {
  if (!text) return '';
  return text
    .replace(/^text-/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
};

/**
 * Detects duplicate answers by normalizing and comparing their text content.
 * Adds isDuplicate flag to each answer object.
 * @param {Array} answers - Array of answer objects
 * @returns {Array} Processed answers with duplicate flags
 */
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
        normalizedText: normalized, // Store normalized text for consistent comparison
      };
    }) || []
  );
};

/**
 * Generates or retrieves a unique ID for an answer.
 * Uses existing _id or id if available, otherwise generates a random ID.
 * @param {Object} answer - The answer object
 * @returns {string} Unique identifier for the answer
 */
const getAnswerId = (answer) => {
  return (
    answer?._id ||
    answer?.id ||
    `gen-${Math.random().toString(36).substr(2, 9)}` // Fallback random ID
  );
};

// ==================== MAIN COMPONENT ====================

const QuestionDetail = () => {
  // Router hooks
  const { id } = useParams(); // Gets question ID from URL
  const navigate = useNavigate(); // For programmatic navigation

  // Custom hooks for data and UI state management
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

  // ==================== EFFECTS ====================

  /**
   * Resets question state when question ID changes or new question data loads
   */
  useEffect(() => {
    if (question) {
      // Process answers to detect duplicates
      const processedAnswers = detectDuplicates(question.answers);
      console.log('Processed answers:', processedAnswers);

      // Reset selection and submission state
      setSelected([]);
      setSubmitted(false);
      setIsCorrect(false);
    }
  }, [id, question, setSelected, setSubmitted, setIsCorrect]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles answer selection based on question type (single/multiple)
   */
  const answerHandlers = {
    handleSelect: (answerId) => {
      const normalizedId = normalizeAnswerText(answerId);
      console.log('Selection event:', {
        answerId,
        normalizedId,
        currentSelected: selected,
      });

      // Single answer question - replace selection
      if (question?.type === 'single') {
        setSelected([answerId]);
      }
      // Multiple answer question - toggle selection
      else {
        setSelected(
          (prev) =>
            prev.includes(answerId)
              ? prev.filter((id) => id !== answerId) // Deselect if already selected
              : [...prev, answerId] // Select if not already selected
        );
      }
    },

    /**
     * Handles question submission
     */
    handleSubmit: async () => {
      console.log('--- Starting Submission ---');
      const isCorrect = await handleSubmit(
        question,
        selected,
        setIsCorrect,
        setSubmitted
      );

      // Debug logging
      let safeLocalData = {};
      try {
        safeLocalData = JSON.parse(localStorage.getItem('quizAnswers') || '{}');
      } catch (e) {
        console.warn('[iOS] localStorage access blocked:', e);
      }

      console.log('Post-Submission State:', {
        isCorrect,
        selectedAnswers: selected,
        questionId: question._id,
        localStorage: safeLocalData,
      });

      // Update state
      if (isCorrect !== undefined) {
        setIsCorrect(isCorrect);
      }
      setSubmitted(true);
    },

    /**
     * Resets question to initial state
     */
    resetQuestion: () => {
      resetQuestion(question, setSelected, setSubmitted, setIsCorrect);
    },
  };

  // ==================== RENDER LOGIC ====================

  // Loading state
  if (loading) return <LoadingState />;

  // Error state
  if (error || !question)
    return <ErrorState error={error} navigate={navigate} />;

  // Calculate progress through question set
  const questionNumber =
    allQuestions.findIndex(
      (q) => q._id === id || q.questionId?.toLowerCase() === id.toLowerCase()
    ) + 1;
  const progress = (questionNumber / allQuestions.length) * 100;

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Progress section with navigation controls */}
      <ProgressSection
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        progress={progress}
        submitted={submitted}
        setShowResetDialog={setShowResetDialog}
        checkAnswerSaved={(qId) => !!localStorage.getItem('quizAnswers')?.[qId]}
      />

      {/* Reset confirmation dialog */}
      <ResetDialog
        open={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          try {
            localStorage.removeItem('quizAnswers');
          } catch (e) {
            console.warn('[iOS] Failed to remove localStorage item:', e);
          }
          window.location.reload();
        }}
      />

      {/* Back button to return to question list */}
      <BackButton navigate={navigate} />

      {/* Question header with all metadata */}
      <QuestionHeader
        question={question}
        showExplanation={showExplanation}
        setShowExplanation={setShowExplanation}
        submitted={submitted}
        isCorrect={isCorrect}
      />

      {/* Answers list with duplicate protection */}
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

      {/* Action buttons (submit, reset, navigation) */}
      <ActionButtons
        submitted={submitted}
        question={question}
        selected={selected}
        questionNumber={questionNumber}
        totalQuestions={allQuestions.length}
        handleSubmit={answerHandlers.handleSubmit}
        resetQuestion={answerHandlers.resetQuestion}
        navigateToQuestion={(offset) => {
          // Navigate to next/previous question
          const currentIndex = allQuestions.findIndex((q) => q._id === id);
          if (currentIndex >= 0) {
            const newQuestion = allQuestions[currentIndex + offset];
            if (newQuestion) navigate(`/questions/${newQuestion._id}`);
          }
        }}
        handleJumpToQuestion={(jumpId) => {
          // Jump to specific question by ID
          const target = allQuestions.find(
            (q) => q.questionId?.toLowerCase() === jumpId.toLowerCase()
          );
          if (target) navigate(`/questions/${target._id}`);
        }}
      />
    </Container>
  );
};

// ==================== SUB-COMPONENTS ====================

/**
 * Loading state component
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
 * Error state component
 * @param {Object} props - Component props
 * @param {Error} props.error - Error object
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
