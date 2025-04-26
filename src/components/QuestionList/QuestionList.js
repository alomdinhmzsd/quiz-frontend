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
} from '@mui/material';
import { motion } from 'framer-motion';
import { fetchQuestions } from './questionService';
import { filterQuestions, sortQuestions, getUniqueDomains } from './utils';
import FilterControls from './FilterControls';

/**
 * QuestionList component - Displays a filterable, sortable list of questions
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

  // Apply filters and sorting
  const filteredQuestions = filterQuestions(questions, filters);
  const sortedQuestions = sortQuestions(filteredQuestions, filters.sortOrder);

  /**
   * Handles filter changes
   * @param {string} name - Filter name
   * @param {string} value - New filter value
   */
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

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

  // Main render
  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      {/* Filter controls */}
      <FilterControls
        filters={filters}
        onChange={handleFilterChange}
        domains={getUniqueDomains(questions)}
      />

      {/* Results */}
      {sortedQuestions.length === 0 ? (
        <Alert severity='info' aria-live='polite'>
          No questions match your filters
        </Alert>
      ) : (
        sortedQuestions.map((question, index) => (
          <motion.div
            key={question._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            aria-label={`Question ${question.questionId}`}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {question.questionId}: {question.question.substring(0, 100)}
                  {question.question.length > 100 && '...'}
                </Typography>
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
        ))
      )}
    </Container>
  );
};

export default QuestionList;
