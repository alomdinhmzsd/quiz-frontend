import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';

const calculateStats = () => {
  const defaultStats = {
    correct: 0,
    incorrect: 0,
    total: 0,
    accuracy: 0,
    domains: {},
    mastered: 0,
  };

  try {
    const savedAnswers = JSON.parse(localStorage.getItem('quizAnswers')) || {};
    const manualMastery =
      JSON.parse(localStorage.getItem('manualMasteryOverrides')) || {};

    const uniqueAnswers = {};
    Object.values(savedAnswers).forEach((entry) => {
      const qid = entry.questionId;
      if (!uniqueAnswers[qid]) {
        uniqueAnswers[qid] = entry;
      }
    });

    const answers = Object.values(uniqueAnswers);
    const correct = answers.filter((a) => a?.isCorrect).length;
    const incorrect = answers.filter((a) => !a?.isCorrect).length;
    const total = answers.length;

    const domains = {};
    const questionStats = {};

    Object.values(savedAnswers).forEach((entry) => {
      if (entry?.domain) {
        if (!domains[entry.domain]) {
          domains[entry.domain] = { correct: 0, total: 0 };
        }
        domains[entry.domain].total++;
        if (entry.isCorrect) {
          domains[entry.domain].correct++;
        }
      }

      if (entry?.questionId) {
        if (!questionStats[entry.questionId]) {
          questionStats[entry.questionId] = { correct: 0, total: 0 };
        }
        questionStats[entry.questionId].total++;
        if (entry.isCorrect) {
          questionStats[entry.questionId].correct++;
        }
      }
    });

    const autoMastered = Object.values(questionStats).filter(
      (s) => s.correct >= 5
    ).length;
    const manualMasteredCount = Object.values(manualMastery).filter(
      (m) => m === true
    ).length;

    return {
      correct,
      incorrect,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      domains,
      mastered: autoMastered + manualMasteredCount,
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return defaultStats;
  }
};

const StatsPanel = () => {
  const [stats, setStats] = useState(calculateStats());
  const [startId, setStartId] = useState('saa-q001');
  const [endId, setEndId] = useState('saa-q065');

  useEffect(() => {
    let timeout;
    const handleStorageChange = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setStats(calculateStats());
      }, 200);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      localStorage.removeItem('quizAnswers');
      localStorage.removeItem('manualMasteryOverrides');
      localStorage.removeItem('examStartId');
      localStorage.removeItem('examEndId');
      setStats(calculateStats());
    }
  };

  const handleStartExam = () => {
    localStorage.setItem('examStartId', startId);
    localStorage.setItem('examEndId', endId);
    window.dispatchEvent(new Event('storage'));
    window.location.reload(); // 👈 Optional but useful if filtering doesn't live-update
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant='h6' gutterBottom>
        Your Progress
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box sx={{ width: '100%', mr: 2 }}>
          <LinearProgress
            variant='determinate'
            value={stats.accuracy}
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        <Typography variant='body1' fontWeight='bold'>
          {stats.accuracy}%
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Chip
          label={`✅ Correct: ${stats.correct}`}
          color='success'
          variant='outlined'
        />
        <Chip
          label={`❌ Incorrect: ${stats.incorrect}`}
          color='error'
          variant='outlined'
        />
        <Chip
          label={`📊 Total: ${stats.total}`}
          color='info'
          variant='outlined'
        />
        <Chip
          label={`🎯 Mastered: ${stats.mastered}`}
          color='success'
          variant='outlined'
        />
      </Box>

      <Divider sx={{ my: 2 }} />
      <Typography variant='subtitle1' gutterBottom>
        Load Questions by Range
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          mb: 3,
          backgroundColor: '#1e1e1e',
          p: 2,
          borderRadius: 2,
        }}>
        <Typography variant='subtitle1' sx={{ mb: 1, color: '#ccc' }}>
          Load Questions by Range
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl fullWidth>
            <InputLabel
              shrink
              htmlFor='start-id'
              sx={{ color: '#ccc' }}></InputLabel>
            <input
              id='start-id'
              type='text'
              value={startId}
              onChange={(e) => setStartId(e.target.value)}
              placeholder='e.g., saa-q001'
              style={{
                padding: '12px',
                fontSize: '1rem',
                width: '100%',
                border: '1px solid #444',
                borderRadius: '6px',
                backgroundColor: '#111',
                color: '#fff',
              }}
            />
          </FormControl>

          <FormControl fullWidth>
            <InputLabel
              shrink
              htmlFor='end-id'
              sx={{ color: '#ccc' }}></InputLabel>
            <input
              id='end-id'
              type='text'
              value={endId}
              onChange={(e) => setEndId(e.target.value)}
              placeholder='e.g., saa-q065'
              style={{
                padding: '12px',
                fontSize: '1rem',
                width: '100%',
                border: '1px solid #444',
                borderRadius: '6px',
                backgroundColor: '#111',
                color: '#fff',
              }}
            />
          </FormControl>
        </Box>
      </Box>

      <Button
        variant='contained'
        color='primary'
        onClick={handleStartExam}
        fullWidth
        sx={{ mb: 2 }}>
        Start Exam
      </Button>

      <Button
        variant='outlined'
        color='error'
        size='small'
        onClick={handleResetProgress}
        fullWidth>
        Reset All Progress
      </Button>
    </Paper>
  );
};

export default StatsPanel;
