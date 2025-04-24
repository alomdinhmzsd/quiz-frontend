// utils/navigation.js
export const navigateToQuestion = (
  id,
  allQuestions,
  navigate,
  offset,
  setError
) => {
  try {
    const currentIndex = allQuestions.findIndex(
      (q) =>
        q._id === id ||
        (q.questionId && q.questionId.toLowerCase() === id.toLowerCase())
    );

    if (currentIndex === -1) {
      setError('Current question not found in list');
      return;
    }

    const newIndex = currentIndex + offset;
    if (newIndex >= 0 && newIndex < allQuestions.length) {
      navigate(`/questions/${allQuestions[newIndex]._id}`);
    }
  } catch (err) {
    setError(`Navigation failed: ${err.message}`);
  }
};

export const handleJumpToQuestion = (
  jumpToId,
  allQuestions,
  navigate,
  setError
) => {
  try {
    if (!jumpToId?.trim()) {
      setError('Please enter a valid question ID');
      return;
    }

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
