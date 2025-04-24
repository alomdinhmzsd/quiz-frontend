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
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Typography
        variant='h6'
        gutterBottom
        sx={{
          fontWeight: 500,
          lineHeight: 1.5,
          whiteSpace: 'pre-wrap',
          flexGrow: 1,
          fontSize: '1.1rem',
        }}>
        {question.questionId}: {question.question}
      </Typography>
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

    <Stack direction='row' spacing={1} sx={{ mb: 2 }}>
      <Chip label={question.domain} size='small' />
      <Chip
        label={
          question.type === 'single' ? 'Single answer' : 'Multiple answers'
        }
        size='small'
        color='secondary'
      />
      {submitted && (
        <Chip
          label={isCorrect ? 'Correct' : 'Incorrect'}
          size='small'
          color={isCorrect ? 'success' : 'error'}
        />
      )}
    </Stack>

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

    {question.reference && (
      <Box
        sx={{
          mb: 3,
          p: 2,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
                wordBreak: 'break-all',
                display: 'block',
                '&:hover': { textDecoration: 'underline' },
              }}>
              {url.trim()}
            </Link>
            {url.includes('aws.amazon.com') && (
              <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                (Official AWS Documentation)
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    )}

    {showExplanation && question.explanation && (
      <Alert severity='info' sx={{ mb: 2 }}>
        <Typography variant='body2'>{question.explanation}</Typography>
      </Alert>
    )}

    <Divider sx={{ my: 2 }} />
  </Paper>
);

export default QuestionHeader;
