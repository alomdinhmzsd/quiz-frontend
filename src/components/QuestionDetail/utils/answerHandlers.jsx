/**
 * answerHandlers.js - Complete and validated version
 * Handles all answer-related operations including:
 * - Answer validation
 * - Progress tracking
 * - Statistics calculation
 * - State management
 *
 * Updated Features:
 * - Mastered questions tracking (5+ correct answers)
 * - Comprehensive stats calculation
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
 * Calculates comprehensive user statistics from saved answers
 * @returns {object} Stats with correct, incorrect, total, accuracy, domains, and mastered counts
 */
export const calculateStats = () => {
  const defaultStats = {
    correct: 0,
    incorrect: 0,
    total: 0,
    accuracy: 0,
    domains: {},
    mastered: 0,
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

    // Calculate domain breakdown and mastered questions
    const domains = {};
    const questionStats = {};
    let mastered = 0;

    answers.forEach((answer) => {
      // Domain stats
      if (answer?.domain) {
        if (!domains[answer.domain]) {
          domains[answer.domain] = { correct: 0, total: 0 };
        }
        domains[answer.domain].total++;
        if (answer.isCorrect) {
          domains[answer.domain].correct++;
        }
      }

      // Question-level stats
      if (answer?.questionId) {
        if (!questionStats[answer.questionId]) {
          questionStats[answer.questionId] = { correct: 0, total: 0 };
        }
        questionStats[answer.questionId].total++;
        if (answer.isCorrect) {
          questionStats[answer.questionId].correct++;
        }

        // Check if mastered (5+ correct)
        if (questionStats[answer.questionId].correct >= 5) {
          mastered++;
        }
      }
    });

    return {
      correct,
      incorrect,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      domains,
      mastered,
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
 * @param {function} setIsCorrect - State setter for correctness
 * @param {function} setSubmitted - State setter for submission status
 * @returns {boolean} Whether submission was correct
 */

// Store the timestamp of last submission at module level
let lastSubmissionTime = 0;

export const handleSubmit = async (
  question,
  selected,
  setIsCorrect,
  setSubmitted
) => {
  if (!question || !selected.length) return;

  // Debounce submissions - minimum 1 second between submissions
  const now = Date.now();
  if (now - lastSubmissionTime < 1000) {
    console.log('Submission debounced - too quick after previous attempt');
    return;
  }
  lastSubmissionTime = now;

  try {
    const normalizedQuestionId = question.questionId.trim().toLowerCase();

    console.log('Submission Debug:', {
      normalizedQuestionId,
      selectedAnswers: selected,
      correctAnswerIds: question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a._id),
      questionText: question.question.substring(0, 50) + '...',
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

    // Save attempt
    const savedAnswers = JSON.parse(
      localStorage.getItem('quizAnswers') || '{}'
    );
    const attemptId = `attempt_${now}`; // Using the debounced timestamp

    savedAnswers[attemptId] = {
      selected,
      isCorrect,
      timestamp: new Date().toISOString(),
      questionId: normalizedQuestionId,
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

// Add these new functions to answerHandlers.js

/**
 * MANUAL MASTERY OVERRIDES
 * Allows users to manually mark questions as mastered/unmastered
 */

const MANUAL_MASTERY_KEY = 'manualMasteryOverrides';

/**
 * Set manual mastery status for a question
 * @param {string} questionId - The question ID
 * @param {boolean} isMastered - Whether to mark as mastered
 */
export const setManualMastery = (questionId, isMastered) => {
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  overrides[questionId] = isMastered;
  localStorage.setItem(MANUAL_MASTERY_KEY, JSON.stringify(overrides));
};

/**
 * Get mastery status (checks manual override first, then automatic stats)
 * @param {string} questionId - The question ID
 * @returns {boolean} Whether the question is mastered
 */
export const getMasteryStatus = (questionId) => {
  // Check manual override first
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  if (questionId in overrides) return overrides[questionId]; // Manual override takes priority

  // Fall back to automatic mastery (5+ correct answers)
  const stats = JSON.parse(localStorage.getItem('quizAnswers')) || {};
  const questionStats = stats[questionId] || { correct: 0 };
  return questionStats.correct >= 5;
};

/**
 * Reset manual mastery for a question (remove override)
 * @param {string} questionId - The question ID
 */
export const resetManualMastery = (questionId) => {
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  delete overrides[questionId];
  localStorage.setItem(MANUAL_MASTERY_KEY, JSON.stringify(overrides));
};
