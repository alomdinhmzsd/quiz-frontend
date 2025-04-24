// hooks/useQuestionUI.js
import { useState } from 'react';

export const useQuestionUI = (question) => {
  const [selected, setSelected] = useState(
    question?.type === 'single' ? '' : []
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState(null); // Add error state here

  return {
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
    error, // Include error in return
    setError, // Include setError in return
  };
};
