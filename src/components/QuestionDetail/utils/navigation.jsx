/**
 * Navigation utilities for quiz questions
 * @module utils/navigation
 */

/**
 * Navigates to adjacent question (previous/next)
 *
 * @param {string} id - Current question ID
 * @param {array} allQuestions - Complete list of questions
 * @param {function} navigate - Navigation function (from react-router)
 * @param {number} offset - Direction (-1 for previous, 1 for next)
 * @param {function} setError - Error state setter
 */
export const navigateToQuestion = (
  id,
  allQuestions,
  navigate,
  offset,
  setError
) => {
  try {
    // Find current question index
    const currentIndex = allQuestions.findIndex(
      (q) =>
        q._id === id ||
        (q.questionId && q.questionId.toLowerCase() === id.toLowerCase())
    );

    if (currentIndex === -1) {
      setError('Current question not found in list');
      return;
    }

    // Calculate and validate new index
    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < allQuestions.length) {
      navigate(`/questions/${allQuestions[newIndex]._id}`);
    }
  } catch (err) {
    setError(`Navigation failed: ${err.message}`);
  }
};

/**
 * Jumps directly to a specific question by ID
 *
 * @param {string} jumpToId - Target question ID (e.g., "saa-Q001")
 * @param {array} allQuestions - Complete list of questions
 * @param {function} navigate - Navigation function (from react-router)
 * @param {function} setError - Error state setter
 */
export const handleJumpToQuestion = (
  jumpToId,
  allQuestions,
  navigate,
  setError
) => {
  try {
    // Validate input
    if (!jumpToId?.trim()) {
      setError('Please enter a valid question ID');
      return;
    }

    // Find question by formatted ID
    const foundQuestion = allQuestions.find(
      (q) =>
        q.questionId &&
        q.questionId.toLowerCase() === jumpToId.toLowerCase().trim()
    );

    if (foundQuestion) {
      navigate(`/questions/${foundQuestion._id}`);
    } else {
      setError(`Question with ID "${jumpToId}" not found`);
    }
  } catch (err) {
    setError(`Jump to question failed: ${err.message}`);
  }
};
