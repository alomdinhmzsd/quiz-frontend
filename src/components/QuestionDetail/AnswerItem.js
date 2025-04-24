import React from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  Radio,
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
    selected.includes(answer._id) ||
    selected.includes(answer.text) ||
    selected.some((id) => id.includes(answer._id || answer.text));

  const ControlComponent = questionType === 'single' ? Radio : Checkbox;

  return (
    <Box
      sx={{
        mb: 1,
        p: 2,
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        borderRadius: 1,
        backgroundColor: isSelected ? 'action.selected' : 'background.paper',
        position: 'relative',
        ...(answer.isDuplicate && {
          borderLeft: '4px solid',
          borderLeftColor: 'warning.main',
        }),
      }}
      onClick={() => handleAnswerSelect(answer._id || answer.text)}>
      <FormControlLabel
        control={
          <ControlComponent
            checked={isSelected}
            disabled={submitted}
            sx={{
              mr: 1,
              ...(submitted && {
                color: answer.isCorrect ? 'success.main' : 'error.main',
              }),
            }}
          />
        }
        label={
          <Typography
            sx={{
              fontWeight: isSelected ? 600 : 400,
              color: submitted
                ? answer.isCorrect
                  ? 'success.main'
                  : 'text.secondary'
                : 'text.primary',
            }}>
            {answer.text}
            {answer.isDuplicate && (
              <Box
                component='span'
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.5,
                  bgcolor: 'warning.light',
                  color: 'warning.contrastText',
                  fontSize: 12,
                  borderRadius: 1,
                }}>
                Duplicate
              </Box>
            )}
          </Typography>
        }
        sx={{ width: '100%', m: 0 }}
      />
      {submitted && answer.explanation && (
        <Typography
          variant='body2'
          sx={{
            mt: 1,
            pl: 4,
            fontStyle: 'italic',
            color: answer.isCorrect ? 'success.main' : 'error.main',
          }}>
          {answer.explanation}
        </Typography>
      )}
    </Box>
  );
};

export default AnswerItem;
