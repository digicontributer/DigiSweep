import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';

import style from './style';

export default function ({ addressError, currentUnit, dgbAddress, getBalance, sendBackup, updateAddress, wallet }) {
  const exportWallet = () => {
    const filename = "export.json";
    const contentType = "application/json;charset=utf-8;";
    const json = wallet.map(w => {
      const obj = {
        name: w.name
      };
      if (w.type !== 'privKey') {
        obj.funds = w.addrs.filter(addr => addr.hasBalance).map(addr => {
          return {
            balance: addr.utxos.filter(i => i.amount).map(i => i.amount).reduce((a, b) => { return a += b; }, 0),
            address: addr.main.privateKey.toAddress().toString(),
            legacyAddress: addr.main.privateKey.toLegacyAddress().toString(),
            privateKey: addr.main.privateKey.toWIF()
          };
        });
      } else {
        obj.name = "PrivateKey";
        obj.funds = {
          balance: w.totalBalance,
          address: w.main.toAddress().toString(),
          legacyAddress: w.main.toLegacyAddress().toString(),
          privateKey: w.main.toWIF()
        }
      }
      return obj;
    });
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      var blob = new Blob([decodeURIComponent(encodeURI(JSON.stringify(json, null, 2)))], { type: contentType });
      navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      var a = document.createElement('a');
      a.download = filename;
      a.href = 'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(json, null, 2));
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <Card style={{ marginTop: '25px' }}>
    <CardContent>
      <div style={{ display: 'flex' }}>
        <Typography className="card-title" color="textPrimary" gutterBottom variant="h5" style={{ flexBasis: '90%' }}>
          Funds Found!
        </Typography>
        <Button variant="contained" color="primary" style={style.exportButton} onClick={exportWallet}>
          Export
        </Button>
      </div>
      <p>We found a total of <b>{ getBalance(wallet.map(i => i.totalBalance).reduce((a,b) => a+=b)) } {currentUnit}</b>. If your balance below looks correct then you may enter a new DigiByte address and we will send you the funds.</p>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Type
              </TableCell>
              <TableCell>
                Address
              </TableCell>
              <TableCell>
                Amount
              </TableCell>
              <TableCell>
                Wallet
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { wallet.filter(i => i.totalBalance).map((i, iterator) => {
              if (i.type !== 'privKey') {
                return i.addrs.filter(o => o.hasBalance).map((o, idx) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        Input
                      </TableCell>
                      <TableCell>
                        {o.main.privateKey.toLegacyAddress().toString()}
                      </TableCell>
                      <TableCell>
                        {getBalance(o.balance)} {currentUnit}
                      </TableCell>
                      <TableCell>
                        {i.name}
                      </TableCell>
                    </TableRow>
                  );
                });
              } else if (i.type === 'privKey') {
                return i.utxos.map((o, idx) => {
                  return (
                    <TableRow key={idx}>
                      <TableCell>
                        Input
                      </TableCell>
                      <TableCell>
                        {o.address}
                      </TableCell>
                      <TableCell>
                        {getBalance(o.amount)} {currentUnit}
                      </TableCell>
                      <TableCell>
                        Private Key
                      </TableCell>
                    </TableRow>
                  );                            
                })
              } else {
                return (<TableRow key={iterator}/>);
              }
            })}
          </TableBody>
        </Table>
        <TextField
          required
          fullWidth
          error={addressError}
          onChange={updateAddress}
          label="Enter DigiByte Address"
          value={dgbAddress}
          margin="normal"
        />
      <Button variant="contained" color="primary" className="submitButton" onClick={sendBackup} disabled={addressError}>
        Send DigiByte to Address
      </Button>
    </CardContent>
  </Card>
  );
}