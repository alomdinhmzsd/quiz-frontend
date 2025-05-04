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
} from '@mui/material';
import { motion } from 'framer-motion';
import { fetchQuestions } from './questionService';
import { filterQuestions, sortQuestions } from './utils';
import StatsPanel from '../StatsPanel';

console.log('StatsPanel import:', StatsPanel); // Should log a function

/**
 * QuestionList component - Displays a filterable, sortable list of questions with performance tracking
 *
 * Features:
 * - Performance indicators for each question
 * - Organized domain filters
 * - Auto-hide mastered questions
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

  /**
   * Get performance stats for a specific question
   * @param {string} questionId - The question ID to get stats for
   * @returns {object} Correct and total attempts count
   */
  const getQuestionStats = (questionId) => {
    try {
      const savedAnswers = JSON.parse(
        localStorage.getItem('quizAnswers') || '{}'
      );
      const questionAnswers = Object.values(savedAnswers).filter(
        (a) => a.questionId === questionId
      );

      const correct = questionAnswers.filter((a) => a.isCorrect).length;
      const total = questionAnswers.length;

      return { correct, total };
    } catch {
      return { correct: 0, total: 0 };
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

  /**
   * Handle filter changes
   * @param {string} name - Filter name
   * @param {string} value - New filter value
   */
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters and sorting
  const filteredQuestions = filterQuestions(questions, filters).filter((q) => {
    if (!hideMastered) return true;
    const stats = getQuestionStats(q.questionId);
    return stats.correct < 5; // Only show if not answered correctly 5+ times
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
            onChange={(e) => handleFilterChange('domain', e.target.value)}>
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
            label='Hide mastered questions (5+ correct)'
          />
        </Box>
      </Box>

      {/* Results */}
      {sortedQuestions.length === 0 ? (
        <Alert severity='info' aria-live='polite'>
          No questions match your filters
        </Alert>
      ) : (
        sortedQuestions.map((question, index) => {
          const questionStats = getQuestionStats(question.questionId);
          return (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              aria-label={`Question ${question.questionId}`}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}>
                    <Typography variant='h6' gutterBottom sx={{ mr: 1 }}>
                      {question.questionId}:{' '}
                      {question.question.substring(0, 100)}
                      {question.question.length > 100 && '...'}
                    </Typography>
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
                        sx={{ mb: 1 }}
                      />
                    )}
                  </Box>
                  <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
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
                  </Stack>
                  <Button
                    component={Link}
                    to={`/questions/${question._id}`}
                    variant='contained'
                    size='small'
                    aria-label={`Practice question ${question.questionId}`}>
                    Practice Question
                  </Button>
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
