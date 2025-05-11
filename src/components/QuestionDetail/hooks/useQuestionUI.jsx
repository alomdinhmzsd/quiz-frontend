// hooks/useQuestionUI.js
import { useState } from 'react';

/**
 * Custom hook for managing question UI state
 * @param {object} question - The current question object
 * @returns {object} Contains:
 *   - selected: Array/string of selected answers
 *   - setSelected: Setter for selected answers
 *   - submitted: Submission status
 *   - setSubmitted: Setter for submission status
 *   - isCorrect: Correctness state
 *   - setIsCorrect: Setter for correctness
 *   - showResetDialog: Reset dialog visibility
 *   - setShowResetDialog: Setter for reset dialog
 *   - showExplanation: Explanation visibility
 *   - setShowExplanation: Setter for explanation
 *   - error: Error message
 *   - setError: Setter for error
 */

export const useQuestionUI = (question) => {
  // Initialize state based on question type
  const [selected, setSelected] = useState(
    question?.type === 'single' ? '' : [] // String for single, array for multiple
  );
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState(null);

  return {
    // Answer selection
    selected,
    setSelected,

    // Submission state
    submitted,
    setSubmitted,

    // Validation state
    isCorrect,
    setIsCorrect,

    // Dialog controls
    showResetDialog,
    setShowResetDialog,

    // Explanation toggle
    showExplanation,
    setShowExplanation,

    // Error handling
    error,
    setError,
  };
};
