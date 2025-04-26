/**
 * Filters questions based on criteria
 * @param {Array} questions - Array of question objects
 * @param {object} filters - Filter criteria
 * @param {string} filters.domain - Domain filter ('all' or specific domain)
 * @param {string} filters.type - Type filter ('all', 'single', or 'multiple')
 * @param {string} filters.searchTerm - Search term filter
 * @returns {Array} Filtered questions
 */
export const filterQuestions = (questions, { domain, type, searchTerm }) => {
  return questions.filter((q) => {
    const matchesDomain = domain === 'all' || q.domain === domain;
    const matchesType = type === 'all' || q.type === type;
    const matchesSearch =
      !searchTerm ||
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.questionId &&
        q.questionId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesDomain && matchesType && matchesSearch;
  });
};

/**
 * Sorts questions by question ID
 * @param {Array} questions - Array of question objects
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted questions
 */
export const sortQuestions = (questions, sortOrder) => {
  return [...questions].sort((a, b) => {
    const numA = parseInt(a.questionId.replace(/saa-q/gi, ''));
    const numB = parseInt(b.questionId.replace(/saa-q/gi, ''));
    return sortOrder === 'asc' ? numA - numB : numB - numA;
  });
};

/**
 * Extracts unique domains from questions
 * @param {Array} questions - Array of question objects
 * @returns {Array} Sorted array of unique domains
 */
export const getUniqueDomains = (questions) => {
  const domains = questions
    .map((q) => q.domain)
    .filter((domain) => domain && domain.trim() !== '');
  return [...new Set(domains)].sort();
};
