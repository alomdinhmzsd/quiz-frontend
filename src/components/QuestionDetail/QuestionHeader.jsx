/**
 * QuestionHeader.js
 *
 * A reusable component that displays the header section of a question, including:
 * - Question text and ID
 * - Domain and type chips
 * - Correct/Incorrect status (when submitted)
 * - Explanation toggle (when available)
 * - Image (when available)
 * - References (when available)
 *
 * Props:
 * @param {Object} question - The question object containing all question data
 * @param {boolean} showExplanation - State flag for explanation visibility
 * @param {function} setShowExplanation - Function to toggle explanation visibility
 * @param {boolean} submitted - Flag indicating if question has been submitted
 * @param {boolean} isCorrect - Flag indicating if submitted answer was correct
 */

import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Chip,
  Stack,
  Alert,
  Divider,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Link from '@mui/material/Link';

const QuestionHeader = ({
  question,
  showExplanation,
  setShowExplanation,
  submitted,
  isCorrect,
}) => (
  <Paper sx={{ p: 3, mb: 3 }}>
    {/* Main question header with ID and text */}
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography
        variant='h6'
        gutterBottom
        sx={{
          fontWeight: 500,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap', // Preserves whitespace and line breaks
          flexGrow: 1,
          fontSize: '1.1rem',
        }}>
        {/* Display question ID followed by question text */}
        {question.questionId}: {question.question}
      </Typography>

      {/* Help icon button for toggling explanation (only shown if explanation exists) */}
      {question.explanation && (
        <Tooltip title='Show explanation'>
          <IconButton
            onClick={() => setShowExplanation(!showExplanation)}
            color={showExplanation ? 'primary' : 'default'}>
            <HelpOutlineIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>

    {/* Chip row showing domain, question type, and correctness status */}
    <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
      {/* Domain chip (e.g., AWS, JavaScript) */}
      {/* <Chip label={question.domain} size='small' /> */}

      {/* Question type chip (Single/Multiple answer) */}
      <Chip
        label={
          question.type === 'single' ? 'Single answer' : 'Multiple answers'
        }
        size='small'
        color='secondary'
      />

      {/* Correct/Incorrect status chip (only shown after submission) */}
      {submitted && (
        <Chip
          label={isCorrect ? 'Correct' : 'Incorrect'}
          size='small'
          color={isCorrect ? 'success' : 'error'}
        />
      )}
    </Stack>

    {/* Question image (if provided) */}
    {question.image && (
      <Box
        component='img'
        src={`/images/${question.image}`}
        alt='Question illustration'
        sx={{
          maxWidth: '100%',
          height: 'auto',
          display: 'block',
          margin: '0 auto',
          mb: 3,
          borderRadius: 1,
          boxShadow: 1,
        }}
      />
    )}

    {/* References section (if provided) */}
    {question.reference && (
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.05)', // Light gray background
          borderRadius: 1,
        }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
          <strong>References:</strong>
        </Typography>
        {question.reference.split('\n\n').map((url, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Link
              href={url.trim()}
              target='_blank'
              rel='noopener noreferrer'
              sx={{
                color: 'primary.main',
                wordBreak: 'break-all', // Ensure long URLs break properly
                display: 'block',
                '&:hover': { textDecoration: 'underline' },
              }}>
              {url.trim()}
            </Link>
            {/* Special indicator for AWS documentation links */}
            {url.includes('aws.amazon.com') && (
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                (Official AWS Documentation)
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    )}

    {/* Explanation section (shown when toggled) */}
    {showExplanation && question.explanation && (
      <Alert severity='info' sx={{ mb: 2 }}>
        <Typography variant='body2'>{question.explanation}</Typography>
      </Alert>
    )}

    {/* Divider at the bottom of the component */}
    <Divider sx={{ my: 2 }} />
  </Paper>
);

export default QuestionHeader;
