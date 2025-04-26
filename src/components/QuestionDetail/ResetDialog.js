import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

/**
 * ResetDialog component - Confirmation dialog for progress reset
 *
 * @param {boolean} open - Controls dialog visibility
 * @param {function} onClose - Callback when dialog closes
 * @param {function} onConfirm - Callback when reset is confirmed
 * @returns {JSX.Element} Confirmation dialog with destructive action
 */
const ResetDialog = ({ open, onClose, onConfirm }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby='reset-dialog-title'
    aria-describedby='reset-dialog-description'>
    <DialogTitle id='reset-dialog-title'>Reset All Progress?</DialogTitle>
    <DialogContent>
      <DialogContentText id='reset-dialog-description'>
        This will clear all your saved answers and progress. This action cannot
        be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color='primary'>
        Cancel
      </Button>
      <Button
        onClick={() => {
          onConfirm();
          onClose();
        }}
        color='error'
        variant='contained'
        autoFocus>
        Reset All
      </Button>
    </DialogActions>
  </Dialog>
);

export default ResetDialog;
