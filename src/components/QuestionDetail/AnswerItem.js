import React from 'react';
import {
  Paper,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
} from '@mui/material';

const AnswerItem = ({
  answer,
  questionType,
  selected,
  submitted,
  handleAnswerSelect,
}) => {
  const isSelected =
    questionType === 'single'
      ? selected === answer._id
      : selected.includes(answer._id);

  const getBackgroundColor = () => {
    if (submitted) {
      return answer.isCorrect
        ? 'rgba(46, 125, 50, 0.3)'
        : isSelected
        ? 'rgba(211, 47, 47, 0.3)'
        : 'background.paper';
    }
    return isSelected ? 'rgba(25, 118, 210, 0.2)' : 'background.paper';
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: getBackgroundColor(),
        border:
          submitted && answer.isCorrect
            ? '1px solid #2e7d32'
            : '1px solid rgba(255, 255, 255, 0.12)',
        cursor: !submitted ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: !submitted ? 'rgba(255, 255, 255, 0.08)' : undefined,
        },
      }}
      onClick={() => !submitted && handleAnswerSelect(answer._id)}>
      <FormControlLabel
        control={
          questionType === 'single' ? (
            <Radio
              checked={isSelected}
              disabled={submitted}
              sx={{
                color: submitted && answer.isCorrect ? '#2e7d32' : undefined,
              }}
            />
          ) : (
            <Checkbox
              checked={isSelected}
              disabled={submitted}
              sx={{
                color: submitted && answer.isCorrect ? '#2e7d32' : undefined,
              }}
            />
          )
        }
        label={
          <Typography
            sx={{
              fontWeight: submitted && answer.isCorrect ? 600 : 400,
              color: submitted && answer.isCorrect ? '#2e7d32' : 'text.primary',
              fontSize: '0.95rem',
            }}>
            {answer.text}
          </Typography>
        }
        sx={{ width: '100%' }}
      />
      {submitted && answer.explanation && (
        <Typography
          variant='body2'
          sx={{
            mt: 1,
            color: answer.isCorrect ? 'success.main' : 'error.main',
            fontStyle: 'italic',
            fontSize: '0.9rem',
          }}>
          {answer.explanation}
        </Typography>
      )}
    </Paper>
  );
};

export default AnswerItem;
