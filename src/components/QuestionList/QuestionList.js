import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Button,
  Card,
  CardContent,
  Typography,
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CardActions,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { fetchQuestions } from './questionService';
import { filterQuestions, sortQuestions } from './utils';
import StatsPanel from '../StatsPanel';

/**
 * MANUAL MASTERY UTILITIES
 * Functions to handle manual mastery overrides
 */
const MANUAL_MASTERY_KEY = 'manualMasteryOverrides';

/**
 * Set manual mastery status for a question
 * @param {string} questionId - The question ID
 * @param {boolean} isMastered - Whether to mark as mastered
 */
const setManualMastery = (questionId, isMastered) => {
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  overrides[questionId] = isMastered;
  localStorage.setItem(MANUAL_MASTERY_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('storage')); // Trigger stats update
};

/**
 * Get mastery status (checks manual override first, then automatic stats)
 * @param {string} questionId - The question ID
 * @returns {boolean} Whether the question is mastered
 */
const getMasteryStatus = (questionId) => {
  // Check manual override first
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  if (questionId in overrides) return overrides[questionId];

  // Fall back to automatic mastery (5+ correct answers)
  const stats = JSON.parse(localStorage.getItem('quizAnswers')) || {};
  const questionStats = stats[questionId] || { correct: 0 };
  return questionStats.correct >= 5;
};

/**
 * QuestionList component - Displays a filterable, sortable list of questions with performance tracking
 *
 * Features:
 * - Performance indicators for each question
 * - Organized domain filters
 * - Auto-hide mastered questions (manual or automatic)
 * - Manual mastery override controls
 * - Preserved stats tracking
 *
 * @param {object} props - Component props
 * @param {string} [props.domainName='all'] - Default domain filter
 * @returns {JSX.Element} Interactive question list interface
 */
const QuestionList = ({ domainName = 'all' }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    domain: domainName,
    type: 'all',
    searchTerm: '',
    sortOrder: 'asc',
  });
  const [hideMastered, setHideMastered] = useState(false);

  // Load questions on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchQuestions();
        setQuestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // In QuestionList.js component
  useEffect(() => {
    const handleStorageChange = () => {
      setQuestions((prev) => [...prev]); // Force re-render
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Get performance stats for a specific question
   * @param {string} questionId - The question ID to get stats for
   * @returns {object} Correct and total attempts count
   */
  const getQuestionStats = (questionId) => {
    try {
      const normalizedId = questionId.trim().toLowerCase();
      const savedAnswers = JSON.parse(
        localStorage.getItem('quizAnswers') || '{}'
      );

      // Filter for unique most recent attempts only
      const uniqueAttempts = Object.values(savedAnswers).reduce(
        (acc, attempt) => {
          if (attempt.questionId === normalizedId) {
            if (!acc[attempt.attemptId]) {
              acc[attempt.attemptId] = attempt;
            }
          }
          return acc;
        },
        {}
      );

      const attempts = Object.values(uniqueAttempts);

      return {
        correct: attempts.filter((a) => a.isCorrect).length,
        total: attempts.length,
        mastered: attempts.filter((a) => a.isCorrect).length >= 5,
      };
    } catch {
      return { correct: 0, total: 0, mastered: false };
    }
  };

  /**
   * Group domains by their main category (e.g., "AWS Compute" -> "AWS")
   * @returns {object} Grouped domains by category
   */
  const getGroupedDomains = () => {
    return questions.reduce((acc, question) => {
      if (!question.domain) return acc;

      const category = question.domain.split(' ')[0];
      if (!acc[category]) {
        acc[category] = new Set();
      }
      acc[category].add(question.domain);
      return acc;
    }, {});
  };

  // Apply filters and sorting
  const filteredQuestions = filterQuestions(questions, filters).filter((q) => {
    if (!hideMastered) return true;
    return !getMasteryStatus(q.questionId); // Hide if manually or automatically mastered
  });

  const sortedQuestions = sortQuestions(filteredQuestions, filters.sortOrder);
  const groupedDomains = getGroupedDomains();

  // Loading state
  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
        aria-live='polite'
        aria-busy='true'>
        <CircularProgress aria-label='Loading questions' />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }} aria-live='assertive'>
          Error loading questions: {error}
        </Alert>
        <Button
          variant='contained'
          onClick={() => window.location.reload()}
          aria-label='Retry loading questions'>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <StatsPanel />

      {/* Filter controls */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id='domain-filter-label'>Domain</InputLabel>
          <Select
            labelId='domain-filter-label'
            value={filters.domain}
            label='Domain'
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, domain: e.target.value }))
            }>
            <MenuItem value='all'>All Domains</MenuItem>
            {Object.entries(groupedDomains).map(([category, domains]) => (
              <optgroup label={category} key={category}>
                {Array.from(domains).map((domain) => (
                  <MenuItem value={domain} key={domain}>
                    {domain}
                  </MenuItem>
                ))}
              </optgroup>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={hideMastered}
                onChange={() => setHideMastered(!hideMastered)}
              />
            }
            label='Hide mastered questions'
          />
        </Box>
      </Box>

      {/* Question list */}
      {sortedQuestions.length === 0 ? (
        <Alert severity='info' aria-live='polite'>
          No questions match your filters
        </Alert>
      ) : (
        sortedQuestions.map((question, index) => {
          const questionStats = getQuestionStats(question.questionId);
          const isMastered = getMasteryStatus(question.questionId);

          return (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}>
              <Card
                sx={{
                  mb: 3,
                  borderLeft: isMastered ? '4px solid #4CAF50' : 'none',
                }}>
                <CardContent>
                  <Box display='flex' alignItems='center'>
                    <Typography variant='h6' sx={{ flexGrow: 1 }}>
                      {question.questionId}:{' '}
                      {question.question.substring(0, 80)}...
                    </Typography>
                    {isMastered && <StarIcon color='success' sx={{ ml: 1 }} />}
                  </Box>

                  <Stack direction='row' spacing={1} sx={{ my: 1 }}>
                    <Chip label={question.domain} size='small' />
                    <Chip
                      label={
                        question.type === 'single'
                          ? 'Single answer'
                          : 'Multiple answers'
                      }
                      size='small'
                      color='secondary'
                    />
                    {questionStats.total > 0 && (
                      <Chip
                        label={`${questionStats.correct}/${questionStats.total}`}
                        size='small'
                        color={
                          questionStats.correct === questionStats.total
                            ? 'success'
                            : questionStats.correct > 0
                            ? 'warning'
                            : 'error'
                        }
                      />
                    )}
                  </Stack>

                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Button
                      component={Link}
                      to={`/questions/${question._id}`}
                      variant='contained'
                      size='small'>
                      Practice Question
                    </Button>

                    {isMastered ? (
                      <Button
                        startIcon={<CloseIcon />}
                        onClick={() =>
                          setManualMastery(question.questionId, false)
                        }
                        color='warning'
                        size='small'>
                        Unmark Mastered
                      </Button>
                    ) : (
                      <Button
                        startIcon={<CheckIcon />}
                        onClick={() =>
                          setManualMastery(question.questionId, true)
                        }
                        color='success'
                        size='small'>
                        Mark as Mastered
                      </Button>
                    )}
                  </CardActions>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </Container>
  );
};

export default QuestionList;
