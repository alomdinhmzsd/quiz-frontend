import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';

export default function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('/api/questions');
        setQuestions(res.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Alert severity='error' sx={{ mb: 2 }}>
          Error loading questions: {error}
        </Alert>
        <Button variant='contained' onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth='md' sx={{ py: 4 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 4 }}>
        Exam Questions
      </Typography>

      {questions.map((question, index) => (
        <motion.div
          key={question._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                {question.questionId}: {question.question.substring(0, 100)}...
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {question.type === 'single'
                  ? 'Single answer'
                  : 'Multiple answers'}
              </Typography>
              <Button
                component={Link}
                to={`/questions/${question._id}`}
                variant='contained'
                size='small'>
                Practice Question
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </Container>
  );
}
