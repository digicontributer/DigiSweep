import Mnemonic from 'digibytejs-mnemonic';

export const BITCOIN_SEED = 'Bitcoin seed';
export const DIGIBYTE_SEED = 'DigiByte seed';
export const GAP_ADDRESSES_LIMIT = 20;

export const fetchUtxos = (addr) => {
  return fetch(`https://digiexplorer.info/api/addr/${addr}/utxo`)
    .then(res => res.json());
}

export const fetchRates = () => {
  return fetch(`https://digibyte.io/rates.php`)
    .then(res => res.json());
}

export const broadcastTransaction = (rawTx) => {
  var data = JSON.stringify({ "rawtx": rawTx });
  return fetch(`https://digiexplorer.info/api/tx/send`, {
    method: 'POST',
    headers : { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: data
  })
    .then(res => res.json());
}

export const derivitors = [{
  path: `m/0`,
  secret: DIGIBYTE_SEED,
  name: 'Core Mobile',
  addrs: []
}, {
  path: `m/44'/0'/0'`,
  secret: BITCOIN_SEED,
  name: 'DigiByte Go',
  addrs: []
}, {
  path: `m/44'/3'/0'`,
  secret: BITCOIN_SEED,
  name: 'BIP44 Doge Wallet',
  addrs: []
}, {
  path: `m/44'/20'/0'`,
  secret: BITCOIN_SEED,
  name: 'BIP44 Wallets',
  addrs: []
}];

export function isSeed(privateKeys) {
  if ((privateKeys.length % 3 === 0) && (privateKeys.length > 11) && (privateKeys.length < 25)) {
    if (privateKeys[0].length<20) {
      if(Mnemonic.isValid(privateKeys.join(' '))) {
        return true;
      }
    }
  }
  return false;
};
