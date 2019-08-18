import React from 'react';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  Input,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@material-ui/core';

export default function ({ wif, gapLimit, selectedServer, startSearch, updateGapLimit, updateSelectedServer, updateWif }) {
  return (
    <Card>
    <CardContent>
      <Typography className="card-title" color="textPrimary" gutterBottom variant="h5">
        Locating Funds
      </Typography>
      <p>This app needs your private information in order to find and move your funds. It is safe to put your information here because it is not recorded or transmitted from your machine. Also when you are done you will have moved the funds to a new wallet so the information will not be helpful to hackers.</p>
      <form className="uploadForm">
        <TextField
          value={wif}
          onChange={updateWif}
          id="outlined-email-input"
          label="Recovery phrase (mnemonic) or File/Text backup"
          className="textField"
          type="text"
          margin="normal"
          variant="outlined"
          multiline
          rowsMax="4" 
          rows="4"
        />
        <div>
          <input
            accept="image/*"
            className="uploadInput"
            id="contained-button-file"
            multiple
            type="file"
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" component="span" className="uploadButton">
            Or Upload File
            </Button>
          </label>
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', margin: '5px' }}>
          <FormControl className="formControl" style={{ flexBasis: '80%' }}>
            <InputLabel shrink htmlFor="server-label-placeholder">
              Server
            </InputLabel>
            <Select
              value={selectedServer}
              onChange={updateSelectedServer}
              input={<Input name="server" fullWidth id="server-label-placeholder" />}
              displayEmpty
              fullWidth
              name="Server"
            >
              <MenuItem value={'https://digiexplorer.info'}>Digiexplorer.info</MenuItem>
              <MenuItem value={'https://explorer-1.us.digibyteservers.io'}>explorer-1.us.digibyteservers.io</MenuItem>
            </Select>
          </FormControl>
          <FormControl className="formControl" style={{ flexBasis: '15%' }}>
            <InputLabel shrink htmlFor="gaplimit-label-placeholder">
              Gap Limit
            </InputLabel>
            <Select
              value={gapLimit}
              onChange={updateGapLimit}
              input={<Input name="gaplimit" id="gaplimit-label-placeholder" />}
              displayEmpty
              name="Gap Limit"
            >
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
              <MenuItem value={500}>500</MenuItem>
              <MenuItem value={1000}>1000</MenuItem>
            </Select>
          </FormControl>
        </div>
      </form>
      <Button variant="contained" color="primary" className="submitButton" onClick={startSearch}>
        Recover My Funds
      </Button>
    </CardContent>
  </Card>    
  );
}