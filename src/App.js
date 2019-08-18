import React, { Component } from 'react';
import DigiByte from 'digibyte';
import Mnemonic from 'digibytejs-mnemonic';
import bip38 from 'bip38';
import Promise from 'bluebird';

import ConfirmDialog from './components/Dialogs/confirmDialog';
import DerivitorStatus from './components/Modals/derivitorStatus';
import ErrorDialog from './components/Dialogs/errorDialog';
import StepOne from './components/StepOne';
import StepTwo from './components/StepTwo';
import StepThree from './components/StepThree';

import { broadcastTransaction, derivitors, GAP_ADDRESSES_LIMIT, fetchRates, fetchUtxos, isSeed } from './utils';
import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentUnit: 'DGB',
      wif: '',
      txid: null,
      dgbAddress: 'D9DvrcnBRuNwv3fAJ7etf2DPYeCC8UAfrN',
      addressError: true,
      wallet: [],
      selectedServer: 'https://digiexplorer.info',
      stepTwo: false,
      stepThree: false,
      confirmDialog: false,
      dialogOpen: false,
      progressModalOpen: false,
      error: null,
      passwordDialog: false,
      derivitorStatus: derivitors.map(i => {
        return { name: i.name, status: 0};
      }),
      usdRate: 0
    }
    this.startSearch = this.startSearch.bind(this);
    this.sendBackup = this.sendBackup.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentDidMount() {
    fetchRates().then(resp => {
      const usdRate = resp.filter(i => i.code === 'USD')[0];
      this.setState({ usdRate: usdRate.rate });
    })
  }

  getBalance(balance) {
    if (this.state.currentUnit === 'USD') {
      return (balance * this.state.usdRate).toFixed(2);
    }
    return balance;
  }

  updateAddress(e) {
    if (DigiByte.Address.isValid(e.target.value)) {
      this.setState({ addressError: false });
    } else {
      this.setState({ addressError: true });
    }
    this.setState({ dgbAddress: e.target.value });
  }

  checkInput() {
    return new Promise((resolve, reject) => {
      const { wif } = this.state;
      if (!wif.length) {
        return resolve(this.setState({ dialogOpen: true, error: 'No Input Provided!' }));
      }
      const privateKeys = wif.replace(/\s/g,",").split(",");
      if (isSeed(privateKeys)) {
        return resolve({ privKeys: privateKeys, type: 'seed' });
      }
  
      if ((privateKeys.length === 1) && (privateKeys[0].substr(0,4) === "xprv")) {
        return resolve({ privKeys: privateKeys, type: 'xPrv' });
      };
  
      const testPrivateKey = wif.split(",").map(privKey => {
        return new Promise((resolve2, reject2) => {
          let splitKey = privKey.split(':');
          if (splitKey[0].substr(0,2) === "6P") {
            const res = bip38.decrypt(splitKey[0], splitKey[1]);
            var newPriv = DigiByte.PrivateKey(res.privateKey).toWIF();
            if(!DigiByte.PrivateKey.isValid(newPriv)) {
              return reject(new Error(`Invalid Private Key: ${newPriv}`));
            } else {
              resolve2(newPriv);
            }
          } else {
            if(!DigiByte.PrivateKey.isValid(privKey)) {
              return reject(new Error(`Invalid Private Key: ${privKey}`));
            } else {
              resolve2(privKey);
            }
          }
        });
      });
      return Promise.all(testPrivateKey).then(results => resolve({ privKeys: results, type: 'privKeys' }));
    });
  }

  updateDerivitorStatus(name, status) {
    return new Promise(resolve => {
      const d = this.state.derivitorStatus.map(i => {
        if (i.name === name) {
          i.status = (status + 1);
        }
        return i;
      });
      this.setState({ derivitorStatus: d }, resolve());
    });
  }

  getNextAddress(seed) {
    seed = seed.join(" ");
    const promises = [];
    derivitors.filter(w => w.addrs.filter(i => !i.hasBalance).length < GAP_ADDRESSES_LIMIT).forEach(derivitor => {
      const getNextKey = () => {
        const len = derivitor.addrs.length;
        const mnemonic = new Mnemonic(seed);
        const hdKey = DigiByte.HDPrivateKey.fromSeed(mnemonic.toSeed(), 'livenet', derivitor.secret);
        const addr = hdKey.derive(`${derivitor.path}/${derivitor.addrs.length}/0`);
        const changeAddr =  hdKey.derive(`${derivitor.path}/${derivitor.addrs.length}/1`);
        derivitor.addrs[len] = { main: addr, change: changeAddr };
        return Promise.all([
          fetchUtxos(addr.privateKey.toAddress().toString()),
          fetchUtxos(addr.privateKey.toLegacyAddress().toString()),
          fetchUtxos(changeAddr.privateKey.toAddress().toString()),
          fetchUtxos(changeAddr.privateKey.toLegacyAddress().toString()),
        ])
        .spread((mainUtxos, mainLegacyUtxos, changeUtxos, changeLegacyUtxos) => {
          if(mainUtxos.length || mainLegacyUtxos.length || changeUtxos.length || changeLegacyUtxos.length) {
            derivitor.addrs[len].hasBalance = true;
          }
          derivitor.addrs[len].mainUtxos = mainUtxos;
          derivitor.addrs[len].mainLegacyUtxos = mainLegacyUtxos;
          derivitor.addrs[len].changeUtxos = changeUtxos;
          derivitor.addrs[len].changeLegacyUtxos = changeLegacyUtxos;              
          derivitor.addrs[len].mainBalance = mainUtxos.length ? mainUtxos.map(i => i.amount).reduce((a, b) =>  { return a += b }) : 0;
          derivitor.addrs[len].mainLegacyBalance = mainLegacyUtxos.length ? mainLegacyUtxos.map(i => i.amount).reduce((a, b) => { return a += b }) : 0;
          derivitor.addrs[len].changeBalance = changeUtxos.length ? changeUtxos.map(i => i.amount).reduce((a, b) => { return a += b }) : 0;
          derivitor.addrs[len].changeLegacyBalance = changeLegacyUtxos.length ? changeLegacyUtxos.map(i => i.amount).reduce((a, b) => { return a += b }) : 0;
          return this.updateDerivitorStatus(derivitor.name, len);
        })
        .then(() => {
          return derivitor;
        });
      }
      promises.push(getNextKey());
    });
    return Promise.all(promises);
  }

  getDataFromSeed(seed, server) {
    return new Promise((resolve, reject) => {
      return this.getNextAddress(seed).then(wallets => {
        if(wallets.some(i => i.addrs.length < GAP_ADDRESSES_LIMIT) || wallets.filter(w => w.addrs.filter(i => !i.hasBalance).length < GAP_ADDRESSES_LIMIT).length) {
          return this.getDataFromSeed(seed);
        }
        return wallets;
      })
      .then(wallet => {
        wallet.forEach(w => {
          w.type = 'seed';
          w.addrs.map(a => {
            a.utxos = [].concat.apply([], [a.mainUtxos, a.mainLegacyUtxos, a.changeUtxos, a.changeLegacyUtxos]);
            return a;
          });
          w.totalBalance = w.addrs.map(a => a.utxos.map(i => i.amount).reduce((a, b) => {
            return a += b;
          }, 0)).reduce((a, b) => a+=b);
        });
        this.setState({ wallet, stepTwo: true, progressModalOpen: false });
      });
    });
  }

  getDataFromKeys(privKeys) {
    return Promise.map(privKeys, key => {
      const o = { main: new DigiByte.PrivateKey(key) };
      return Promise.all([
        fetchUtxos(o.main.toAddress().toString()),
        fetchUtxos(o.main.toLegacyAddress().toString())
      ])
        .spread((mainUtxos, legacyUtxos) => {
          o.utxos = [].concat(mainUtxos, legacyUtxos);
          o.hasBalance = o.utxos.some(i => i.amount);
          o.totalBalance = o.utxos.map(i => i.amount).reduce((a, b) => a+=b);
          o.type = 'privKey';
          return o;
        });
    })
    .then(wallet => {
      return this.setState({ wallet, stepTwo: true });
    });
  }

  getNextXprvAddress(xprv, derivitor) {
    const path = `m/0'/`;
    const len = derivitor.addrs.length;
    const hdKey = DigiByte.HDPrivateKey(xprv);
    const addr = hdKey.derive(`${path}0'/0'`);
    const changeAddr =  hdKey.derive(`${path}1'/0`);
    derivitor.addrs[len] = { main: addr, change: changeAddr };
    return Promise.all([
      fetchUtxos(addr.privateKey.toAddress().toString()),
      fetchUtxos(addr.privateKey.toLegacyAddress().toString()),
      fetchUtxos(changeAddr.privateKey.toAddress().toString()),
      fetchUtxos(changeAddr.privateKey.toLegacyAddress().toString()),
    ])
    .spread((mainUtxos, mainLegacyUtxos, changeUtxos, changeLegacyUtxos) => {
      if(mainUtxos.length || mainLegacyUtxos.length || changeUtxos.length || changeLegacyUtxos.length) {
        derivitor.addrs[len].hasBalance = true;
      }
      derivitor.addrs[len].mainUtxos = mainUtxos;
      derivitor.addrs[len].mainLegacyUtxos = mainLegacyUtxos;
      derivitor.addrs[len].changeUtxos = changeUtxos;
      derivitor.addrs[len].changeLegacyUtxos = changeLegacyUtxos;              
      derivitor.addrs[len].mainBalance = mainUtxos.length ? mainUtxos.map(i => i.amount).reduce((a, b) =>  { return a += b }) : 0;
      derivitor.addrs[len].mainLegacyBalance = mainLegacyUtxos.length ? mainLegacyUtxos.map(i => i.amount).reduce((a, b) => { return a += b }) : 0;
      derivitor.addrs[len].changeBalance = changeUtxos.length ? changeUtxos.map(i => i.amount).reduce((a, b) => { return a += b }) : 0;
      derivitor.addrs[len].changeLegacyBalance = changeLegacyUtxos.length ? changeLegacyUtxos.map(i => i.amount).reduce((a, b) => { return a += b }) : 0;
      return this.updateDerivitorStatus(derivitor.name, len);
    })
    .then(() => {
      return derivitor;
    });
  }

  getDataFromXprv(xprv, wallet) {
    const derivitor = wallet ? wallet : { addrs: [], name: 'DigiByte Core' };
    return this.getNextXprvAddress(xprv[0], derivitor).then(wallets => {
      if(wallets.addrs.length < GAP_ADDRESSES_LIMIT || wallets.addrs.filter(i => !i.hasBalance).length < GAP_ADDRESSES_LIMIT) {
        return this.getDataFromXprv(xprv, wallets);
      }
      return wallets;
    })
    .then(wallets => {
      if(wallets) {
        wallets.type = 'Core';
        wallets.addrs.map(a => {
          a.utxos = [].concat.apply([], [a.mainUtxos, a.mainLegacyUtxos, a.changeUtxos, a.changeLegacyUtxos]);
          return a;
        });
        wallets.totalBalance = wallets.addrs.map(a => a.utxos.map(i => i.amount).reduce((a, b) => {
          return a += b;
        }, 0)).reduce((a, b) => a+=b);
        this.setState({ wallet: [wallets], stepTwo: true, progressModalOpen: false });
      }
    });
  }

  startSearch() {
    this.setState({ stepTwo: false });
    return this.checkInput()
      .then(results => {
        switch (results.type) {
          case 'seed':
            this.setState({ progressModalOpen: true });
            return this.getDataFromSeed(results.privKeys);

          case 'privKeys':
            return this.getDataFromKeys(results.privKeys);

          case 'xPrv':
            this.setState({ progressModalOpen: true, derivitorStatus: [{ 'name': 'DigiByte Core', status: 0}] });
            return this.getDataFromXprv(results.privKeys);

          default: 
            return Promise.reject(new Error('Unknown type!'));
        };
      })
      .catch(err => {
        console.log(err);
        this.setState({ dialogOpen: true, error: err.message })
      });
  }

  sendBackup() {
    const tx = new DigiByte.Transaction();
    const utxos = [];
    const privKeys = [];
    const fee = 1000;
    this.state.wallet.forEach(w => {
      if (w.type !== 'privKey') {
        w.addrs.forEach(a => {
          a.utxos.forEach(utxo => {
            if (utxo.address === a.main.privateKey.toLegacyAddress().toString() || utxo.address === a.main.privateKey.toAddress().toString()) {
              privKeys.push(a.main.privateKey.toString());
            } else if (utxo.address === a.change.privateKey.toLegacyAddress().toString() || utxo.address === a.change.privateKey.toAddress().toString()) {
              privKeys.push(a.change.privateKey.toString());
            }
            utxos.push(utxo)
          });
        });
      } else {
        w.utxos.forEach(utxo => utxos.push(utxo));
        privKeys.push(w.main.toString());       
      }
    });
    tx.from(utxos);
    tx.to(this.state.dgbAddress, DigiByte.Unit.fromDGB(utxos.map(i => i.amount).reduce((a,b) => a+=b)).toSatoshis() - fee);
    tx.fee(fee);
    privKeys.forEach(p => tx.sign(p.toString()));
    return broadcastTransaction(tx.serialize()).then(resp => {
      const txid = resp.txid;
      this.setState({ txid, stepThree: true, stepTwo: false, confirmDialog: false });
    })
    .catch(err => {
      console.log(err);
      this.setState({ dialogOpen: true, error: err.message })
    })
  }
  
  reset() {
    this.setState({
      wif: '',
      dgbAddress: '',
      addressError: true,
      wallet: [],
      selectedServer: 'https://digiexplorer.info',
      stepTwo: false,
      confirmDialog: false,
      dialogOpen: false,
      progressModalOpen: false,
      error: null,
      passwordDialog: false,
      derivitorStatus: derivitors.map(i => {
        return { name: i.name, status: 0};
      })
    });
  }

  render() {
    return (
      <div className="App">
        <ConfirmDialog
          address={this.state.dgbAddress}
          amount={this.state.wallet.length ? this.getBalance(this.state.wallet.map(i => i.totalBalance).reduce((a,b) => a+=b)) : 0}
          cancelDialog={() => this.setState({ dgbAddress: '', confirmDialog: false })}
          confirmDialog={this.sendBackup}
          dialogOpen={this.state.confirmDialog}
        />
        <ErrorDialog
          dialogOpen={this.state.dialogOpen}
          error={this.state.error}
          closeDialog={() => this.setState({ dialogOpen: false })}
        />
        <DerivitorStatus closeModal={() => this.setState({ progressModalOpen: false})} derivitorStatus={this.state.derivitorStatus} progressModalOpen={this.state.progressModalOpen} />
        <header className="App-header">
          <h1>DigiSweep</h1>
          <div style={{ paddingRight: '25px', cursor: 'pointer', userSelect: 'none' }} onClick={() => this.setState({ currentUnit: this.state.currentUnit === 'DGB' ? 'USD' : 'DGB' })}>
            <h2>Unit: {this.state.currentUnit}</h2>
          </div>
        </header>
        <div className="App-body">
          { this.state.stepThree &&
            <StepThree txid={this.state.txid} />
          }
          { !this.state.stepThree && 
            <StepOne
              wif={this.state.wif}
              selectedServer={this.state.selectedServer}
              updateWif={e => this.setState({ wif: e.target.value })}
              updateSelectedServer={e => this.setState({ selectedServer: e.target.value })}
              startSearch={this.startSearch}
            />
          }

          { this.state.stepTwo &&
            <StepTwo
              addressError={this.state.addressError}
              currentUnit={this.state.currentUnit}
              getBalance={bal => this.getBalance(bal)}
              dgbAddress={this.state.dgbAddress}
              sendBackup={() => this.setState({ confirmDialog: true })}
              updateAddress={this.updateAddress}
              wallet={this.state.wallet}
            />             
          }
        </div>
        <footer className="App-footer">

        </footer>
      </div>
    );
  }
}

export default App;
