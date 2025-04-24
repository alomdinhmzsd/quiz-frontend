export const filterQuestions = (questions, { domain, type, searchTerm }) => {
  return questions.filter((q) => {
    const matchesDomain = domain === 'all' || q.domain === domain;
    const matchesType = type === 'all' || q.type === type;
    const matchesSearch =
      !searchTerm ||
      q.question.toLowerCase().includes(searchTerm) ||
      q.questionId.toLowerCase().includes(searchTerm);
    return matchesDomain && matchesType && matchesSearch;
  });
};

export const sortQuestions = (questions, sortOrder) => {
  return [...questions].sort((a, b) => {
    const numA = parseInt(a.questionId.replace(/saa-q/gi, ''));
    const numB = parseInt(b.questionId.replace(/saa-q/gi, ''));
    return sortOrder === 'asc' ? numA - numB : numB - numA;
  });
};

export const getUniqueDomains = (questions) => {
  return [...new Set(questions.map((q) => q.domain).filter(Boolean))];
};
