import React from 'react';
import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * BackButton component - Simple navigation back button
 *
 * @returns {JSX.Element} Button with back navigation functionality
 */

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => navigate('/')}
      sx={{ mb: 3 }}>
      Back to Questions
    </Button>
  );
};

export default BackButton;
