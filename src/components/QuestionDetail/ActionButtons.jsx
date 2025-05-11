import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

/**
 * ActionButtons component - Handles navigation and answer submission
 *
 * @param {boolean} submitted - Whether the current question has been submitted
 * @param {object} question - Current question object
 * @param {array} selected - Array of selected answer IDs
 * @param {number} questionNumber - Current question index
 * @param {number} totalQuestions - Total number of questions
 * @param {function} navigateToQuestion - Handler for prev/next navigation
 * @param {function} handleSubmit - Answer submission handler
 * @param {function} resetQuestion - Reset question state handler
 * @param {string} jumpToId - ID for question jump functionality
 * @param {function} setJumpToId - Setter for jumpToId
 * @param {function} handleJumpToQuestion - Handler for jump-to-question
 * @param {function} handleKeyDown - Keydown handler for text input
 */

const ActionButtons = ({
  submitted,
  question,
  selected,
  questionNumber,
  totalQuestions,
  navigateToQuestion,
  handleSubmit,
  resetQuestion,
  jumpToId,
  setJumpToId,
  handleJumpToQuestion,
  handleKeyDown,
}) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      mt: 3,
      gap: 2,
    }}>
    {/* Unsubmitted State - Navigation and Submit */}
    {!submitted ? (
      <>
        {/* Previous Question Button */}
        <Button
          variant='outlined'
          startIcon={<NavigateBeforeIcon />}
          onClick={() => navigateToQuestion(-1)}
          disabled={questionNumber <= 1}
          sx={{ minWidth: '120px' }}>
          Previous
        </Button>

        {/* Submit Answer Button */}

        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={
            question.type === 'single'
              ? !selected // Disabled if no selection for single-answer
              : selected.length === 0 // Disabled if no selections for multi-answer
          }
          sx={{ flex: 1 }}>
          Submit Answer
        </Button>

        {/* Next Question Button */}
        <Button
          variant='outlined'
          endIcon={<NavigateNextIcon />}
          onClick={() => navigateToQuestion(1)}
          disabled={questionNumber >= totalQuestions}
          sx={{ minWidth: '120px' }}>
          Next
        </Button>
      </>
    ) : (
      /* Submitted State - Reset, Jump, and Continue */
      <>
        {/* Try Again Button */}
        <Button
          variant='outlined'
          onClick={resetQuestion}
          sx={{ minWidth: '120px' }}>
          Try Again
        </Button>

        {/* Question Jump Controls */}
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          <TextField
            size='small'
            placeholder='Jump to ID (saa-Q001)'
            value={jumpToId}
            onChange={(e) => setJumpToId(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{ flex: 1 }}
          />
          <Button
            variant='contained'
            onClick={handleJumpToQuestion}
            disabled={!jumpToId}>
            Go
          </Button>
        </Box>

        {/* Next Question Button (Submitted State) */}

        <Button
          variant='contained'
          endIcon={<NavigateNextIcon />}
          onClick={() => navigateToQuestion(1)}
          disabled={questionNumber >= totalQuestions}
          sx={{ minWidth: '120px' }}>
          Next Question
        </Button>
      </>
    )}
  </Box>
);

export default ActionButtons;
