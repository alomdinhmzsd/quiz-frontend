export const handleAnswerSelect = (
  answerId,
  questionType,
  selected = [],
  setSelected,
  submitted
) => {
  // Validation
  if (typeof answerId !== 'string') {
    console.error('answerId must be a string, received:', answerId);
    return;
  }
  if (!['single', 'multiple'].includes(questionType)) {
    console.error('Invalid questionType:', questionType);
    return;
  }
  if (submitted) {
    console.warn('Selection locked - question already submitted');
    return;
  }

  if (questionType === 'single') {
    setSelected([answerId]); // Always use array for consistency
  } else {
    setSelected((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
    });
  }
};

export const handleSubmit = (
  question,
  selected = [],
  setIsCorrect,
  setSubmitted
) => {
  if (!question?.answers) {
    console.error('Invalid question:', question);
    return;
  }

  const correctAnswers = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => a._id);

  const isCorrect =
    question.type === 'single'
      ? selected.length === 1 && correctAnswers.includes(selected[0])
      : selected.length > 0 &&
        selected.every((id) => correctAnswers.includes(id)) &&
        correctAnswers.every((id) => selected.includes(id));

  setIsCorrect(isCorrect);
  setSubmitted(true);
};

export const resetQuestion = (
  question,
  setSelected,
  setSubmitted,
  setIsCorrect
) => {
  setSelected([]); // Reset to empty array for both types
  setSubmitted(false);
  setIsCorrect(false);
};
