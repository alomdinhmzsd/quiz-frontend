/**
 * answerHandlers.js - Complete and validated version
 * Handles all answer-related operations including:
 * - Answer validation
 * - Progress tracking
 * - Statistics calculation
 * - State management
 */

/**
 * Normalizes answer text for consistent comparison
 * @param {string} text - Raw answer text
 * @returns {string} Normalized text
 */
export const normalizeAnswerText = (text) => {
  if (!text) return '';
  return text
    .toString()
    .replace(/^text-/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
};

/**
 * Calculates user statistics from saved answers
 * @returns {object} Stats with correct, incorrect, total, accuracy, and domains
 */
export const calculateStats = () => {
  const defaultStats = {
    correct: 0,
    incorrect: 0,
    total: 0,
    accuracy: 0,
    domains: {},
  };

  try {
    const savedData = localStorage.getItem('quizAnswers');
    if (!savedData) return defaultStats;

    const savedAnswers = JSON.parse(savedData);
    if (!savedAnswers || typeof savedAnswers !== 'object') {
      return defaultStats;
    }

    const answers = Object.values(savedAnswers);
    const correct = answers.filter((a) => a?.isCorrect).length;
    const incorrect = answers.filter((a) => !a?.isCorrect).length;
    const total = correct + incorrect;

    // Calculate domain breakdown
    const domains = {};
    answers.forEach((answer) => {
      if (!answer?.domain) return;

      if (!domains[answer.domain]) {
        domains[answer.domain] = { correct: 0, total: 0 };
      }
      domains[answer.domain].total++;
      if (answer.isCorrect) {
        domains[answer.domain].correct++;
      }
    });

    return {
      correct,
      incorrect,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      domains,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return defaultStats;
  }
};

/**
 * Handles answer submission and validation
 * @param {object} question - Current question
 * @param {array} selected - Selected answer IDs
 * @param {function} setIsCorrect - Correctness state setter
 * @param {function} setSubmitted - Submission state setter
 * @returns {boolean} Whether submission was correct
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
    console.log('Submission Debug:', {
      questionId: question._id,
      selectedAnswers: selected,
      correctAnswerIds: question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a._id),
      questionText: question.question,
    });

    // Determine correctness
    const isCorrect =
      question.type === 'single'
        ? question.answers.some((a) => a.isCorrect && selected[0] === a._id)
        : question.answers
            .filter((a) => a.isCorrect)
            .every((correctAnswer) => selected.includes(correctAnswer._id));

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
      questionId: question.questionId,
      questionText: question.question,
      domain: question.domain,
      type: question.type,
    };
    localStorage.setItem('quizAnswers', JSON.stringify(savedAnswers));

    return isCorrect;
  } catch (error) {
    console.error('Submission Error:', error);
    setIsCorrect(false);
    setSubmitted(true);
    return false;
  }
};

/**
 * Resets question state
 * @param {function} setSelected - Selected answers setter
 * @param {function} setSubmitted - Submitted state setter
 * @param {function} setIsCorrect - Correctness state setter
 */
export const resetQuestion = (setSelected, setSubmitted, setIsCorrect) => {
  setSelected([]);
  setSubmitted(false);
  setIsCorrect(false);
  console.log('Question state reset');
};

/**
 * Resets all progress tracking data
 * @returns {boolean} Whether reset was successful
 */
export const resetAllProgress = () => {
  try {
    localStorage.removeItem('quizAnswers');
    return true;
  } catch (error) {
    console.error('Error resetting progress:', error);
    return false;
  }
};
