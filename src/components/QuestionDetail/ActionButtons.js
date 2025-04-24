import React from 'react';
import { Box, Button, TextField } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
    {!submitted ? (
      <>
        <Button
          variant='outlined'
          startIcon={<NavigateBeforeIcon />}
          onClick={() => navigateToQuestion(-1)}
          disabled={questionNumber <= 1}
          sx={{ minWidth: '120px' }}>
          Previous
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={
            question.type === 'single' ? !selected : selected.length === 0
          }
          sx={{ flex: 1 }}>
          Submit Answer
        </Button>
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
      <>
        <Button
          variant='outlined'
          onClick={resetQuestion}
          sx={{ minWidth: '120px' }}>
          Try Again
        </Button>
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
