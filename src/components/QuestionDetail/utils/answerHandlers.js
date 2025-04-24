export const handleAnswerSelect = (
  answerId,
  questionType,
  selected,
  setSelected,
  submitted
) => {
  if (submitted) return;

  if (questionType === 'single') {
    setSelected(answerId);
  } else {
    setSelected((prev) => {
      const currentSelection = prev === '' ? [] : prev;
      return currentSelection.includes(answerId)
        ? currentSelection.filter((id) => id !== answerId)
        : [...currentSelection, answerId];
    });
  }
};

export const handleSubmit = (
  question,
  selected,
  setIsCorrect,
  setSubmitted
) => {
  if (!question) return;

  const correctAnswers = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => a._id);

  let isCorrect;
  if (question.type === 'single') {
    isCorrect = correctAnswers.includes(selected);
  } else {
    isCorrect =
      selected.length > 0 &&
      selected.every((id) => correctAnswers.includes(id)) &&
      correctAnswers.every((id) => selected.includes(id));
  }

  setIsCorrect(isCorrect);
  setSubmitted(true);
};

export const resetQuestion = (
  question,
  setSelected,
  setSubmitted,
  setIsCorrect
) => {
  setSelected(question.type === 'single' ? '' : []);
  setSubmitted(false);
  setIsCorrect(false);
};
