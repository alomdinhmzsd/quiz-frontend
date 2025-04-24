// ProgressSection.js (simplified version without PropTypes)
import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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
      <Box sx={{ width: '80%' }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          Question {questionNumber} of {totalQuestions}
        </Typography>
        <LinearProgress
          variant='determinate'
          value={progress}
          sx={{ height: 8, borderRadius: 4 }}
        />
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
      <Tooltip title='Reset all progress'>
        <IconButton onClick={() => setShowResetDialog(true)} color='error'>
          <RestartAltIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ProgressSection;
