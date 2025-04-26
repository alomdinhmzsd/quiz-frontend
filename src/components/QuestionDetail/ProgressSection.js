import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

/**
 * ProgressSection component - Displays quiz progress and reset controls
 *
 * @param {number} questionNumber - Current question index (1-based)
 * @param {number} totalQuestions - Total number of questions
 * @param {number} progress - Completion percentage (0-100)
 * @param {function} checkAnswerSaved - Callback to check if answer exists in storage
 * @param {function} setShowResetDialog - Setter for reset dialog visibility
 * @param {boolean} submitted - Whether current question is submitted
 * @returns {JSX.Element} Progress bar with navigation controls
 */
const ProgressSection = ({
  questionNumber,
  totalQuestions,
  progress,
  checkAnswerSaved,
  setShowResetDialog,
  submitted,
}) => {
  const savedAnswer = checkAnswerSaved();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
      {/* Progress display section */}
      <Box sx={{ width: '80%' }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          Question {questionNumber} of {totalQuestions}
        </Typography>

        {/* Progress bar */}
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />

        {/* Answer status text */}
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
          {savedAnswer
            ? `${
                submitted ? 'Answer saved' : 'Previous answer available'
              } - ${new Date(
                savedAnswer?.timestamp || Date.now()
              ).toLocaleString()}`
            : 'Answer not yet saved'}
        </Typography>
      </Box>

      {/* Reset progress button */}
      <Tooltip title='Reset all progress'>
        <IconButton
          onClick={() => setShowResetDialog(true)}
          color='error'
          aria-label='Reset progress'>
          <RestartAltIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProgressSection;
