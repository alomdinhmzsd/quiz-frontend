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
import FilterControls from './FilterControls'; // Import the new component

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

  const filteredQuestions = filterQuestions(questions, filters);
  const sortedQuestions = sortQuestions(filteredQuestions, filters.sortOrder);

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Error loading questions: {error}
        </Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <FilterControls
        filters={filters}
        onChange={handleFilterChange}
        domains={getUniqueDomains(questions)}
      />

      {sortedQuestions.length === 0 ? (
        <Alert severity='info'>No questions match your filters</Alert>
      ) : (
        sortedQuestions.map((question, index) => (
          <motion.div
            key={question._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}>
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
                  size='small'>
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
