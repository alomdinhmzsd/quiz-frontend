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
  questionType,
  selected,
  submitted,
  handleAnswerSelect,
}) => {
  // Enhanced validation with fallback ID generation
  if (!answer || typeof answer !== 'object') {
    console.error('Invalid answer:', answer);
    return <Alert severity='error'>Invalid answer format</Alert>;
  }

  // Generate stable ID from text if missing _id/id
  const answerId =
    answer._id ||
    answer.id ||
    (answer.text &&
      `text-${answer.text.substring(0, 20).replace(/\s+/g, '_')}`) ||
    `answer-${Math.random().toString(36).substring(2, 9)}`;

  const answerText = answer.text || `Answer ${answerId.substring(0, 4)}`;
  const isSelected = selected?.includes(answerId) || false;
  const isMulti = String(questionType).toLowerCase().includes('multi');

  const handleClick = () => {
    if (!submitted && handleAnswerSelect) {
      handleAnswerSelect(answerId);
    }
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        cursor: !submitted ? 'pointer' : 'default',
        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : undefined,
      }}
      onClick={handleClick}>
      <FormControlLabel
        control={
          isMulti ? (
            <Checkbox checked={isSelected} disabled={submitted} />
          ) : (
            <Radio checked={isSelected} disabled={submitted} />
          )
        }
        label={<Typography>{answerText}</Typography>}
      />
    </Paper>
  );
};

export default AnswerItem;
