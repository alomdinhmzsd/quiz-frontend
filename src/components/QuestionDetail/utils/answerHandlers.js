export const normalizeAnswerText = (text) => {
  if (!text) return '';
  return text
    .replace(/^text-/, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
};

export const handleAnswerSelect = (
  answerId,
  questionType,
  selected,
  setSelected,
  submitted
) => {
  if (submitted) return;

  const normalizedId = normalizeAnswerText(answerId);
  console.log('Selecting:', { raw: answerId, normalized: normalizedId });

  if (questionType === 'single') {
    setSelected([answerId]); // Use raw ID for UI consistency
  } else {
    setSelected((prev) =>
      prev.includes(answerId)
        ? prev.filter((id) => id !== answerId)
        : [...prev, answerId]
    );
  }
};

export const handleSubmit = (
  question,
  selected,
  setIsCorrect,
  setSubmitted
) => {
  if (!question || !selected.length) return;

  const normalizedSelected = selected.map(normalizeAnswerText);
  const correctAnswers = question.answers
    .filter((a) => a.isCorrect)
    .map((a) => normalizeAnswerText(a.text));

  console.log('Validation:', {
    selected: normalizedSelected,
    correct: correctAnswers,
  });

  const isCorrect =
    question.type === 'single'
      ? correctAnswers.includes(normalizedSelected[0])
      : correctAnswers.every((ans) => normalizedSelected.includes(ans));

  setIsCorrect(isCorrect);
  setSubmitted(true);

  // Save to localStorage
  const savedAnswers = JSON.parse(localStorage.getItem('quizAnswers') || '{}');
  savedAnswers[question._id] = { selected, isCorrect };
  localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));
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
