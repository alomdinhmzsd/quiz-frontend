// 📁 src/components/QuestionList.jsx

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

const MANUAL_MASTERY_KEY = 'manualMasteryOverrides';

const setManualMastery = (questionId, isMastered) => {
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  overrides[questionId] = isMastered;
  localStorage.setItem(MANUAL_MASTERY_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('storage'));
};

const getMasteryStatus = (questionId) => {
  const overrides = JSON.parse(localStorage.getItem(MANUAL_MASTERY_KEY)) || {};
  if (questionId in overrides) return overrides[questionId];

  const savedAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
  const questionAttempts = Object.values(savedAnswers).filter(
    (a) => a.questionId === questionId
  );
  const correctCount = questionAttempts.filter((a) => a.isCorrect).length;
  return correctCount >= 5;
};

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

  const getQuestionStats = (questionId) => {
    try {
      const savedAnswers =
        JSON.parse(localStorage.getItem('quizAnswers')) || {};
      const attempts = Object.values(savedAnswers).filter(
        (a) => a.questionId === questionId
      );

      const correct = attempts.filter((a) => a.isCorrect).length;
      const total = attempts.length;
      const mastered = correct >= 5;
      return { correct, total, mastered };
    } catch {
      return { correct: 0, total: 0, mastered: false };
    }
  };

  const getGroupedDomains = () => {
    return questions.reduce((acc, question) => {
      if (!question.domain) return acc;
      const category = question.domain.split(' ')[0];
      if (!acc[category]) acc[category] = new Set();
      acc[category].add(question.domain);
      return acc;
    }, {});
  };

  // 🧠 Apply exam range filtering here
  const startId = localStorage.getItem('examStartId');
  const endId = localStorage.getItem('examEndId');
  const rangeFilteredQuestions =
    startId && endId
      ? questions.filter(
          (q) => q.questionId >= startId && q.questionId <= endId
        )
      : questions;

  const filteredQuestions = filterQuestions(
    rangeFilteredQuestions,
    filters
  ).filter((q) => {
    if (!hideMastered) return true;
    return !getMasteryStatus(q.questionId);
  });

  const sortedQuestions = sortQuestions(filteredQuestions, filters.sortOrder);
  const groupedDomains = getGroupedDomains();

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
        <Alert severity='error'>{`Error loading questions: ${error}`}</Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <StatsPanel />

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        {false && (
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
              {Object.entries(groupedDomains).map(([cat, domains]) => (
                <optgroup label={cat} key={cat}>
                  {[...domains].map((domain) => (
                    <MenuItem value={domain} key={domain}>
                      {domain}
                    </MenuItem>
                  ))}
                </optgroup>
              ))}
            </Select>
          </FormControl>
        )}
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

      {/* Question cards */}
      {sortedQuestions.length === 0 ? (
        <Alert severity='info'>No questions match your filters</Alert>
      ) : (
        sortedQuestions.map((question, index) => {
          const stats = getQuestionStats(question.questionId);
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
                    {/* Domain label removed */}
                    <Chip
                      label={
                        question.type === 'single'
                          ? 'Single answer'
                          : 'Multiple answers'
                      }
                      size='small'
                      color='secondary'
                    />
                    <Chip
                      label={`${stats.correct}/${stats.total}`}
                      size='small'
                      color={
                        stats.correct >= 5
                          ? 'success'
                          : stats.correct > 0
                          ? 'warning'
                          : 'error'
                      }
                    />
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
