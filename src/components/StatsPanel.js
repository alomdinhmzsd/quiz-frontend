/**
 * components/StatsPanel.js - New Component
 *
 * Displays user progress statistics with:
 * - Correct/incorrect counts
 * - Accuracy percentage
 * - Domain breakdown
 * - Reset progress button
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import { calculateStats } from './QuestionDetail/utils/answerHandlers';

const StatsPanel = () => {
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    accuracy: 0,
    domains: {},
  });

  // Load and calculate stats when component mounts
  useEffect(() => {
    const updateStats = () => {
      const currentStats = calculateStats();
      setStats(currentStats);
    };

    updateStats();

    // Optional: Update stats when localStorage changes
    const handleStorageChange = () => updateStats();
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all progress?')) {
      localStorage.removeItem('quizAnswers');
      setStats(calculateStats()); // Refresh stats after reset
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
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
      </Box>

      {Object.keys(stats.domains).length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant='subtitle1' gutterBottom>
            By Domain:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(stats.domains).map(([domain, data]) => (
              <Chip
                key={domain}
                label={`${domain}: ${Math.round(
                  (data.correct / data.total) * 100
                )}%`}
                sx={{
                  backgroundColor:
                    data.correct / data.total >= 0.7
                      ? 'success.light'
                      : data.correct / data.total >= 0.4
                      ? 'warning.light'
                      : 'error.light',
                }}
              />
            ))}
          </Box>
        </>
      )}

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
