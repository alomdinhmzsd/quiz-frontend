import React from 'react';
import {
  Box,
  FormControlLabel,
  Checkbox,
  Radio,
  Typography,
} from '@mui/material';

/**
 * AnswerItem component - Renders individual answer options
 *
 * @param {object} answer - Answer object containing text, _id, etc.
 * @param {string} questionType - 'single' or 'multiple' answer type
 * @param {array} selected - Array of selected answer IDs
 * @param {boolean} submitted - Whether question is submitted
 * @param {function} handleAnswerSelect - Handler for answer selection
 */
const AnswerItem = ({
  answer,
  questionType,
  selected,
  submitted,
  handleAnswerSelect,
}) => {
  // Determine if current answer is selected
  const isSelected =
    selected.includes(answer._id) ||
    selected.includes(answer.text) ||
    selected.some((id) => id.includes(answer._id || answer.text));

  // Use Radio for single-answer, Checkbox for multiple-answer
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
        // Special styling for duplicate answers
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
              // Color feedback after submission
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
                  ? 'success.main' // Green for correct answers
                  : 'text.secondary' // Dim for incorrect
                : 'text.primary', // Normal when not submitted
            }}>
            {answer.text}
            {/* Duplicate answer indicator */}
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
      {/* Show explanation after submission if available */}
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
