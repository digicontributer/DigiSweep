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

export default function ({ wif, selectedServer, startSearch, updateSelectedServer, updateWif }) {
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
        <FormControl className="formControl">
          <InputLabel shrink htmlFor="server-label-placeholder">
            Server
          </InputLabel>
          <Select
            value={selectedServer}
            onChange={updateSelectedServer}
            input={<Input name="server" id="server-label-placeholder" />}
            displayEmpty
            name="Server"
          >
            <MenuItem value={'https://digiexplorer.info'}>Digiexplorer.info</MenuItem>
            <MenuItem value={'https://explorer-1.us.digibyteservers.io'}>explorer-1.us.digibyteservers.io</MenuItem>
          </Select>
        </FormControl>
      </form>
      <Button variant="contained" color="primary" className="submitButton" onClick={startSearch}>
        Recover My Funds
      </Button>
    </CardContent>
  </Card>    
  );
}