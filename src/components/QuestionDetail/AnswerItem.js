import React from 'react';
import {
  Paper,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';

const AnswerItem = ({
  answer,
  questionType = 'single',
  selected = [],
  submitted = false,
  handleAnswerSelect = () => {},
}) => {
  // Enhanced validation
  if (!answer || typeof answer !== 'object') {
    console.error('Invalid answer prop:', answer);
    return <Alert severity='error'>Invalid answer format</Alert>;
  }

  const answerId = answer._id || Math.random().toString();
  const isSelected = selected.includes(answerId);
  const answerText = answer.text || `Answer ${answerId}`;

  const handleClick = () => {
    if (!submitted) {
      console.log('Selecting answer:', answerId);
      handleAnswerSelect(answerId);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.1)' : undefined,
        cursor: !submitted ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      elevation={isSelected ? 3 : 1}>
      <FormControlLabel
        control={
          questionType === 'single' ? (
            <Radio
              checked={isSelected}
              disabled={submitted}
              inputProps={{ 'aria-label': `Select answer ${answerId}` }}
            />
          ) : (
            <Checkbox
              checked={isSelected}
              disabled={submitted}
              inputProps={{ 'aria-label': `Select answer ${answerId}` }}
            />
          )
        }
        label={<Typography component='div'>{answerText}</Typography>}
        sx={{ width: '100%', alignItems: 'flex-start' }}
      />
    </Paper>
  );
};

export default AnswerItem;
