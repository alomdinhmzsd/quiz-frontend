import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
} from '@mui/material';
import { motion } from 'framer-motion';

export default function QuestionList() {
  const { domainName } = useParams();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState(domainName || 'all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/api/questions');
        setQuestions(res.data);
        setFilteredQuestions(res.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = [...questions];

    // Apply domain filter
    if (domainFilter && domainFilter !== 'all') {
      filtered = filtered.filter((q) => q.domain === domainFilter);
    }

    // Apply type filter
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter((q) => q.type === typeFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.question.toLowerCase().includes(term) ||
          q.answers.some((a) => a.text.toLowerCase().includes(term))
      );
    }

    setFilteredQuestions(filtered);
  }, [questions, domainFilter, typeFilter, searchTerm]);

  // Get unique domains for filter dropdown
  const domains = [...new Set(questions.map((q) => q.domain))].filter(Boolean);
  const questionTypes = ['single', 'multi'];

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
      <Typography variant='h4' gutterBottom sx={{ mb: 4 }}>
        Exam Questions
      </Typography>

      {/* Filter controls */}
      <Stack direction='row' spacing={2} sx={{ mb: 4 }} alignItems='center'>
        <TextField
          label='Search questions'
          variant='outlined'
          size='small'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 2 }}
        />

        <FormControl sx={{ minWidth: 180 }} size='small'>
          <InputLabel>Domain</InputLabel>
          <Select
            value={domainFilter}
            label='Domain'
            onChange={(e) => setDomainFilter(e.target.value)}>
            <MenuItem value='all'>All Domains</MenuItem>
            {domains.map((domain) => (
              <MenuItem key={domain} value={domain}>
                {domain}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }} size='small'>
          <InputLabel>Type</InputLabel>
          <Select
            value={typeFilter}
            label='Type'
            onChange={(e) => setTypeFilter(e.target.value)}>
            <MenuItem value='all'>All Types</MenuItem>
            {questionTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type === 'single' ? 'Single Answer' : 'Multiple Answers'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {filteredQuestions.length === 0 ? (
        <Alert severity='info'>No questions match your filters</Alert>
      ) : (
        filteredQuestions.map((question, index) => (
          <motion.div
            key={question._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  {question.questionId}: {question.question.substring(0, 100)}
                  ...
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
}
