import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';

export default function ({ closeDialog, dialogOpen, error }) {
  return (
    <Dialog
      open={dialogOpen}
      onClose={closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{"Error:"}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {error}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary" autoFocus>
          Okay
        </Button>
      </DialogActions>
    </Dialog> 
  );
}