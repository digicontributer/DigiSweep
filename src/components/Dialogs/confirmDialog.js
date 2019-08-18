import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core';


export default function ({ address, amount, cancelDialog, confirmDialog, dialogOpen }) {
  return (
    <Dialog
      open={dialogOpen}
      onClose={cancelDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Confirm</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you wish to send ALL DigiByte (<b>{amount}DGB</b>) from this seed to <b>{address}</b>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelDialog} color="primary" autoFocus>
          Cancel
        </Button>
        <Button onClick={confirmDialog} color="primary" autoFocus>
          Okay
        </Button>
      </DialogActions>
    </Dialog> 
  );
}