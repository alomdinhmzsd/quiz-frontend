// 📁 src/components/StatsPanel.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Paper,
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
      setStats(calculateStats());
    }
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

      {/* Domain breakdown UI hidden for mobile clarity */}

      <Button
        variant='outlined'
        color='error'
        size='small'
        onClick={handleResetProgress}
        sx={{ mt: 2 }}>
        Reset All Progress
      </Button>
    </Paper>
  );
};

export default StatsPanel;
