import React from 'react';
import {
  Card,
  CardContent,
  Typography,
} from '@material-ui/core';

export default function ({ txid }){
  return (
    <Card>
      <CardContent>
        <Typography className="card-title" color="textPrimary" gutterBottom variant="h5">
          Transaction Sent!
        </Typography>
        <h4>TXID: <a href={`https://digiexplorer.info/tx/${txid}`}>{txid}</a></h4>
      </CardContent>
    </Card>
  );
}