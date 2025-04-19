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
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { motion } from 'framer-motion';
import SortIcon from '@mui/icons-material/Sort';

export default function QuestionList() {
  const { domainName } = useParams();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState(domainName || 'all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');

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

    // Apply search filter with questionId support
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      const isQuestionIdSearch = term.match(/^saa-q\d{3,4}$/i);

      filtered = filtered.filter((q) => {
        if (isQuestionIdSearch) {
          return q.questionId.toLowerCase() === term;
        }
        return (
          q.question.toLowerCase().includes(term) ||
          q.answers.some((a) => a.text.toLowerCase().includes(term)) ||
          q.questionId.toLowerCase().includes(term)
        );
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const numA = parseInt(a.questionId.replace(/saa-q/gi, ''));
      const numB = parseInt(b.questionId.replace(/saa-q/gi, ''));
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    setFilteredQuestions(filtered);
  }, [questions, domainFilter, typeFilter, searchTerm, sortOrder]);

  // Get unique domains and question types
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
          label='Search questions or IDs'
          variant='outlined'
          size='small'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flex: 2 }}
          placeholder='Search text or saa-Q001'
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

        <ToggleButtonGroup
          value={sortOrder}
          exclusive
          onChange={(e, newOrder) => newOrder && setSortOrder(newOrder)}
          size='small'>
          <ToggleButton value='asc' aria-label='Sort ascending'>
            <SortIcon sx={{ transform: 'rotate(180deg)' }} />
          </ToggleButton>
          <ToggleButton value='desc' aria-label='Sort descending'>
            <SortIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Question list */}
      {filteredQuestions.length === 0 ? (
        <Alert severity='info'>No questions match your filters</Alert>
      ) : (
        filteredQuestions.map((question, index) => (
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
}
