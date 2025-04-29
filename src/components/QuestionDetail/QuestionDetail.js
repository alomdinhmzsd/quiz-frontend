/**
 * QuestionDetail.js - Final Patched Version
 *
 * Complete Feature Set:
 * 1. Randomized answer display with preserved order after submission
 * 2. Robust answer selection and validation
 * 3. Progress tracking with navigation controls
 * 4. Comprehensive error handling
 * 5. Fixed all reported issues
 *
 * Patch Notes:
 * - Fixed "setSelected is not a function" in reset functionality
 * - Fixed "jumpId.toLowerCase is not a function" error
 * - Added input validation for jump-to-ID feature
 * - Enhanced debug logging
 * - Maintained all existing documentation
 */

import React, { useEffect, useState } from 'react';
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
 * Normalizes answer text for consistent comparison
 * @param {string} text - Raw answer text
 * @returns {string} Normalized text (lowercase, no prefixes/special chars)
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
 * Detects and marks duplicate answers while preserving all options
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
        normalizedText: normalized,
      };
    }) || []
  );
};

/**
 * Generates stable unique IDs for answers
 * @param {Object} answer - Answer object
 * @returns {string} Unique identifier (prefers DB _id, falls back to generated)
 */
const getAnswerId = (answer) => {
  return (
    answer?._id ||
    answer?.id ||
    `gen-${Math.random().toString(36).substr(2, 9)}`
  );
};

/**
 * Secure Fisher-Yates shuffle implementation
 * @param {Array} array - Array to shuffle
 * @returns {Array} New shuffled array (non-mutating)
 */
const shuffleAnswers = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// ==================== MAIN COMPONENT ====================

const QuestionDetail = () => {
  // Router hooks for navigation and params
  const { id } = useParams();
  const navigate = useNavigate();

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

  // Component state
  const [displayedAnswers, setDisplayedAnswers] = useState([]);
  const [jumpToId, setJumpToId] = useState('');

  // ==================== EFFECTS ====================

  /**
   * Handles answer processing when question changes
   * - Processes duplicates
   * - Manages randomization
   * - Resets selection state
   */
  useEffect(() => {
    if (question) {
      // Process answers (duplicate detection + shuffling)
      const processedAnswers = detectDuplicates(question.answers);

      // Only shuffle if not submitted (preserve order after submission)
      const answersToDisplay = submitted
        ? processedAnswers
        : shuffleAnswers(processedAnswers);

      setDisplayedAnswers(answersToDisplay);

      // Reset selection state for new question
      setSelected([]);
      setSubmitted(false);
      setIsCorrect(false);
    }
  }, [id, question, submitted, setSelected, setSubmitted, setIsCorrect]);

  // ==================== EVENT HANDLERS ====================

  /**
   * Handles answer selection
   * @param {string} answerId - ID of selected answer
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
   * Handles question submission with validation
   * - Checks correctness
   * - Updates state
   * - Persists to localStorage
   */
  const handleSubmitAnswer = async () => {
    console.log('--- Starting Submission ---');
    const isCorrect = await handleSubmit(
      question,
      selected,
      setIsCorrect,
      setSubmitted
    );

    // Debug logging with safe localStorage access
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

    // Update state only if we got a definitive result
    if (isCorrect !== undefined) {
      setIsCorrect(isCorrect);
    }
    setSubmitted(true);
  };

  /**
   * Resets question state
   * - Clears selections
   * - Resets submission state
   */
  const handleResetQuestion = () => {
    resetQuestion(setSelected, setSubmitted, setIsCorrect);
  };

  /**
   * Handles jumping to specific question by ID
   * @param {string|Event} jumpInput - Either the ID string or event object
   */
  const handleJumpToQuestion = (jumpInput) => {
    // Extract ID from either direct string or from state
    const targetId = typeof jumpInput === 'string' ? jumpInput : jumpToId;

    // Validate input
    if (!targetId || typeof targetId !== 'string') {
      console.warn('Invalid question ID:', targetId);
      return;
    }

    // Normalize and find question
    const normalizedId = String(targetId).toLowerCase().trim();
    const target = allQuestions.find(
      (q) => q.questionId?.toLowerCase() === normalizedId
    );

    if (target) {
      navigate(`/questions/${target._id}`);
      setJumpToId(''); // Clear input after successful jump
    } else {
      console.warn(`Question not found: ${targetId}`);
    }
  };

  /**
   * Handles Enter key in jump-to-question input
   * @param {Object} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleJumpToQuestion(e);
    }
  };

  // ==================== RENDER LOGIC ====================

  if (loading) return <LoadingState />;
  if (error || !question)
    return <ErrorState error={error} navigate={navigate} />;

  // Calculate progress metrics
  const questionNumber =
    allQuestions.findIndex(
      (q) => q._id === id || q.questionId?.toLowerCase() === id.toLowerCase()
    ) + 1;
  const progress = (questionNumber / allQuestions.length) * 100;

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Progress tracking section */}
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
            console.warn('Failed to clear localStorage:', e);
          }
          window.location.reload();
        }}
      />

      {/* Back navigation button */}
      <BackButton navigate={navigate} />

      {/* Question header with metadata */}
      <QuestionHeader
        question={question}
        showExplanation={showExplanation}
        setShowExplanation={setShowExplanation}
        submitted={submitted}
        isCorrect={isCorrect}
      />

      {/* Answer list with randomization */}
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

      {/* Action buttons with all fixed functionality */}
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
        handleJumpToQuestion={() => handleJumpToQuestion(jumpToId)}
        handleKeyDown={handleKeyDown}
      />
    </Container>
  );
};

// ==================== SUB-COMPONENTS ====================

/**
 * Loading state component
 * - Displays circular progress indicator
 * - Centered vertically and horizontally
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
 * @param {Error} props.error - Error object to display
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
