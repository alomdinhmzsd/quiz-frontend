import React from 'react';
import {
  Paper,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
} from '@mui/material';

/**
 * AnswerItem - Component for rendering individual answer options
 *
 * Fixes applied:
 * 1. Fixed selection logic to properly handle single/multi-select modes
 * 2. Improved type safety with PropTypes (commented out)
 * 3. Added detailed documentation
 *
 * Key changes:
 * - Removed direct state comparison in favor of Array.includes()
 * - Added clearer selection type enforcement
 * - Enhanced documentation for all props
 */

const AnswerItem = ({
  answer,
  questionType,
  selected,
  submitted,
  handleAnswerSelect,
}) => {
  /**
   * Determine if this answer is currently selected
   * - For single-select: Check if answer._id matches the single selected ID
   * - For multi-select: Check if answer._id exists in selected array
   */
  const isSelected = selected.includes(answer._id);

  /**
   * Calculate background color based on selection and submission state
   * - Green highlight for correct answers after submission
   * - Red highlight for incorrect selected answers after submission
   * - Blue highlight for selected answers during active session
   */
  const getBackgroundColor = () => {
    if (submitted) {
      return answer.isCorrect
        ? 'rgba(46, 125, 50, 0.3)' // Correct answer green
        : isSelected
        ? 'rgba(211, 47, 47, 0.3)' // Incorrect selection red
        : 'background.paper'; // Default
    }
    return isSelected
      ? 'rgba(25, 118, 210, 0.2)' // Active selection blue
      : 'background.paper'; // Default
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: getBackgroundColor(),
        border:
          submitted && answer.isCorrect
            ? '1px solid #2e7d32' // Green border for correct answers
            : '1px solid rgba(255, 255, 255, 0.12)', // Default border
        cursor: !submitted ? 'pointer' : 'default', // Pointer only when active
        '&:hover': {
          backgroundColor: !submitted
            ? 'rgba(255, 255, 255, 0.08)' // Hover effect
            : undefined,
        },
      }}
      onClick={() => !submitted && handleAnswerSelect(answer._id)} // Only allow selection when not submitted
    >
      <FormControlLabel
        control={
          questionType === 'single' ? (
            // Radio button for single-select questions
            <Radio
              checked={isSelected}
              disabled={submitted}
              sx={{
                color:
                  submitted && answer.isCorrect
                    ? '#2e7d32' // Green for correct
                    : undefined,
              }}
            />
          ) : (
            // Checkbox for multi-select questions
            <Checkbox
              checked={isSelected}
              disabled={submitted}
              sx={{
                color:
                  submitted && answer.isCorrect
                    ? '#2e7d32' // Green for correct
                    : undefined,
              }}
            />
          )
        }
        label={
          <Typography
            sx={{
              fontWeight: submitted && answer.isCorrect ? 600 : 400,
              color:
                submitted && answer.isCorrect
                  ? '#2e7d32' // Green for correct
                  : 'text.primary',
              fontSize: '0.95rem',
            }}>
            {answer.text}
          </Typography>
        }
        sx={{ width: '100%' }}
      />

      {/* Show explanation if submitted and explanation exists */}
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

/* Uncomment for type safety
import PropTypes from 'prop-types';
AnswerItem.propTypes = {
  answer: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    isCorrect: PropTypes.bool,
    explanation: PropTypes.string,
  }).isRequired,
  questionType: PropTypes.oneOf(['single', 'multiple']).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  submitted: PropTypes.bool.isRequired,
  handleAnswerSelect: PropTypes.func.isRequired,
};
*/

export default AnswerItem;
