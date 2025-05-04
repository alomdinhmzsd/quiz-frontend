import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
  Chip,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * ProgressSection component - Displays quiz progress, question stats, and reset controls
 *
 * @param {number} questionNumber - Current question index (1-based)
 * @param {number} totalQuestions - Total number of questions
 * @param {number} progress - Completion percentage (0-100)
 * @param {function} checkAnswerSaved - Callback to check if answer exists in storage
 * @param {function} setShowResetDialog - Setter for reset dialog visibility
 * @param {boolean} submitted - Whether current question is submitted
 * @param {Object|null} questionStats - Previous attempt stats for current question
 * @returns {JSX.Element} Progress bar with stats and navigation controls
 */
const ProgressSection = ({
  questionNumber,
  totalQuestions,
  progress,
  checkAnswerSaved,
  setShowResetDialog,
  submitted,
  questionStats,
}) => {
  const savedAnswer = checkAnswerSaved();

  return (
    <Box sx={{ mb: 4 }}>
      {/* Progress header with question stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant='body2' color='text.secondary'>
          Question {questionNumber} of {totalQuestions}
        </Typography>

        {/* Question attempt history */}
        {questionStats && (
          <Tooltip title={`Last attempted: ${questionStats.lastAttempt}`}>
            <Chip
              icon={
                questionStats.isCorrect ? <CheckCircleIcon /> : <CancelIcon />
              }
              label={
                questionStats.isCorrect
                  ? 'Previously correct'
                  : 'Previously incorrect'
              }
              color={questionStats.isCorrect ? 'success' : 'error'}
              size='small'
            />
          </Tooltip>
        )}
      </Box>

      {/* Progress bar */}
      <LinearProgress
        variant='determinate'
        value={progress}
        sx={{ height: 8, borderRadius: 4, mb: 1 }}
      />

      {/* Answer status section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Typography variant='caption' color='text.secondary'>
          {savedAnswer
            ? `${
                submitted ? 'Answer saved' : 'Previous answer available'
              } - ${new Date(
                savedAnswer?.timestamp || Date.now()
              ).toLocaleString()}`
            : 'Answer not yet saved'}
        </Typography>

        {/* Reset progress button */}
        <Tooltip title='Reset all progress'>
          <IconButton
            onClick={() => setShowResetDialog(true)}
            color='error'
            size='small'
            aria-label='Reset progress'>
            <RestartAltIcon fontSize='small' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ProgressSection;
