import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

const ResetDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Reset All Progress?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        This will clear all your saved answers and progress. This action cannot
        be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        color='error'
        variant='contained'>
        Reset All
      </Button>
    </DialogActions>
  </Dialog>
);

export default ResetDialog;
