export const handleSubmit = (
  question,
  selected = [],
  setIsCorrect,
  setSubmitted
) => {
  if (!question?.answers) {
    console.error('Invalid question:', question);
    return false;
  }

  // Get correct answer IDs
  const correctAnswers = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => a._id || a.id);

  // Special case: no selection made
  if (selected.length === 0) {
    setIsCorrect(false);
    setSubmitted(true);
    return false;
  }

  // Validate answer(s)
  let isCorrect;
  if (question.type === 'single') {
    isCorrect = selected.length === 1 && correctAnswers.includes(selected[0]);
  } else {
    // For multiple select, must have all correct answers and no incorrect ones
    isCorrect =
      selected.every((id) => correctAnswers.includes(id)) &&
      correctAnswers.every((id) => selected.includes(id));
  }

  setIsCorrect(isCorrect);
  setSubmitted(true);
  return isCorrect;
};

// utils/answerHandlers.js
export const handleAnswerSelect = (
  answerId,
  questionType,
  selected,
  setSelected,
  submitted
) => {
  if (submitted || !answerId) return;

  const normalizedType = String(questionType).toLowerCase();
  const isMulti = normalizedType.includes('multi');

  console.log(`Selecting ${answerId} in ${isMulti ? 'multi' : 'single'} mode`);

  if (isMulti) {
    setSelected((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(answerId)
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];
    });
  } else {
    setSelected([answerId]);
  }
};

export const resetQuestion = (
  question,
  setSelected,
  setSubmitted,
  setIsCorrect
) => {
  setSelected([]);
  setSubmitted(false);
  setIsCorrect(false);
};
