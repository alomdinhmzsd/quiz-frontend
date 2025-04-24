/**
 * Answer Handlers - Utility functions for managing answer selection and validation
 *
 * Key Improvements:
 * 1. Fixed single-select state handling (now uses array consistently)
 * 2. Added comprehensive error handling
 * 3. Improved type safety
 * 4. Added detailed documentation
 */

/**
 * Handles answer selection for both single and multiple choice questions
 * @param {string} answerId - ID of the selected answer
 * @param {'single'|'multiple'} questionType - Question type
 * @param {string[]} selected - Current selected answer IDs
 * @param {function} setSelected - State setter for selected answers
 * @param {boolean} submitted - Whether question is submitted
 */
export const handleAnswerSelect = (
  answerId,
  questionType,
  selected,
  setSelected,
  submitted
) => {
  if (submitted) {
    console.warn('Question already submitted - selection locked');
    return;
  }

  if (questionType === 'single') {
    // Single-select: Replace current selection
    setSelected([answerId]);
  } else {
    // Multi-select: Toggle selection
    setSelected((prev) => {
      if (!Array.isArray(prev)) {
        console.error('Selected state should be an array');
        return [answerId]; // Fallback
      }
      return prev.includes(answerId)
        ? prev.filter((id) => id !== answerId) // Deselect
        : [...prev, answerId]; // Select
    });
  }
};

/**
 * Validates and submits the current answer selection
 * @param {object} question - Current question data
 * @param {string[]} selected - Selected answer IDs
 * @param {function} setIsCorrect - State setter for correctness
 * @param {function} setSubmitted - State setter for submission status
 */
export const handleSubmit = (
  question,
  selected,
  setIsCorrect,
  setSubmitted
) => {
  if (!question) {
    console.error('No question provided');
    return;
  }

  if (!Array.isArray(selected)) {
    console.error('Selected answers should be an array');
    selected = []; // Fallback
  }

  // Get all correct answer IDs
  const correctAnswers = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => a._id);

  let isCorrect;
  if (question.type === 'single') {
    // Single-select: Check if single selected answer is correct
    isCorrect = selected.length === 1 && correctAnswers.includes(selected[0]);
  } else {
    // Multi-select: Check perfect match between selected and correct answers
    isCorrect =
      selected.length > 0 &&
      selected.every((id) => correctAnswers.includes(id)) &&
      correctAnswers.every((id) => selected.includes(id));
  }

  setIsCorrect(isCorrect);
  setSubmitted(true);
};

/**
 * Resets question to initial state
 * @param {object} question - Current question data
 * @param {function} setSelected - State setter for selected answers
 * @param {function} setSubmitted - State setter for submission status
 * @param {function} setIsCorrect - State setter for correctness
 */
export const resetQuestion = (
  question,
  setSelected,
  setSubmitted,
  setIsCorrect
) => {
  if (!question) {
    console.error('No question provided for reset');
    return;
  }

  // Reset to empty array for both types (consistent with AnswerItem expectations)
  setSelected([]);
  setSubmitted(false);
  setIsCorrect(false);
};

/* Uncomment for type safety
import PropTypes from 'prop-types';
const questionShape = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['single', 'multiple']).isRequired,
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      isCorrect: PropTypes.bool.isRequired,
    })
  ).isRequired,
});
*/
