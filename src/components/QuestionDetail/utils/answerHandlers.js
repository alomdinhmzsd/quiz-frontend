/**
 * Normalizes answer text for consistent comparison
 * - Removes 'text-' prefix (case-insensitive)
 * - Replaces underscores and hyphens with spaces
 * - Trims whitespace and converts to lowercase
 * @param {string} text - Raw answer text
 * @returns {string} Normalized text
 */
export const normalizeAnswerText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/^text-/i, '')
    .replace(/[_-]/g, ' ') // Both underscores and hyphens
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .toLowerCase();
};

/**
 * Handles answer submission and validation
 * - Compares selected answer IDs with correct answer IDs
 * - Supports both single and multiple answer questions
 * - Saves results to localStorage for persistence
 * @param {object} question - The full question object
 * @param {array} selected - Array of selected answer IDs
 * @param {function} setIsCorrect - State setter for correctness
 * @param {function} setSubmitted - State setter for submission status
 * @returns {boolean} Whether the answer was correct
 */
export const handleSubmit = async (
  question,
  selected,
  setIsCorrect,
  setSubmitted
) => {
  if (!question || !selected.length) return;

  try {
    // Debug: Log raw submission data
    console.log('Submission Debug - Raw Data:', {
      questionId: question._id,
      selectedAnswers: selected,
      correctAnswerIds: question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a._id),
      questionText: question.text,
    });

    // Determine correctness by comparing IDs directly
    const isCorrect =
      question.type === 'single'
        ? // For single-answer: check if selected ID matches any correct answer ID
          question.answers.some((a) => a.isCorrect && selected[0] === a._id)
        : // For multi-answer: check all correct answers are selected
          question.answers
            .filter((a) => a.isCorrect)
            .every((correctAnswer) => selected.includes(correctAnswer._id));

    console.log('Validation Debug:', {
      selectedAnswerIds: selected,
      correctAnswerIds: question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a._id),
      isCorrect,
    });

    // Update state
    setIsCorrect(isCorrect);
    setSubmitted(true);

    // Save to localStorage
    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    savedAnswers[question._id] = {
      selected,
      isCorrect,
      timestamp: new Date().toISOString(),
      questionText: question.text,
    };
    localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));

    return isCorrect;
  } catch (error) {
    console.error('Submission Error:', {
      error: error.message,
      questionId: question?._id,
    });
    setIsCorrect(false);
    setSubmitted(true);
    return false;
  }
};

/**
 * Resets question state
 * - Clears selected answers
 * - Resets submission and correctness states
 * @param {function} setSelected - State setter for selected answers
 * @param {function} setSubmitted - State setter for submission status
 * @param {function} setIsCorrect - State setter for correctness
 **/
export const resetQuestion = (setSelected, setSubmitted, setIsCorrect) => {
  setSelected([]);
  setSubmitted(false);
  setIsCorrect(false);
  console.log('Question state reset');
};
