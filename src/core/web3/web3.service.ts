import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/take';

import getWeb3 from '../shared/util/get-web3';
import Web3 from 'web3';
import { default as contract } from 'truffle-contract';
import { Transaction } from './transaction.model';
import { Web3Actions } from './web3.actions';

declare let window: any;

@Injectable()
export class Web3Service {
  public web3: Web3;

  constructor(private store: Store<any>) {
  }

  init() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    return new Promise((resolve, reject) => {
      getWeb3.then((results: any) => {
        if (results == 'no_web3_provider') {
          return resolve('no_web3_provider');
        }
        this.web3 = results.web3;
        if (this.web3 && this.web3.currentProvider &&
            this.web3.currentProvider['isMetaMask'] &&
            this.web3.currentProvider['isConnected']() &&
            this.web3.currentProvider['publicConfigStore']) {

          let state = this.web3.currentProvider['publicConfigStore'].getState();
          if (!state.networkVersion) {
            return resolve('invalid_state');
          }
          if (state.networkVersion === 'loading') {
            return resolve('loading');
          }
          if (state.networkVersion === '1') {
            return resolve('mainnet');
          }
          if (state.networkVersion !== '311001') {
            return resolve('not_e11_poa');
          }
          this.getAccounts().then((accounts) => {
            if (!accounts || !accounts.length) return resolve('locked');
            return resolve();
          }).catch(e => {
            let error = e && e.message? e.message:e;
            if (error) return resolve(error);
          })
        } else {
          return resolve('metamask_error');
        }
      }).catch(e => {
        let error = e && e.message? e.message:e;
        resolve(error);
      });
    });
  }

  getBlockNumber() {
    return this.web3.eth.getBlockNumber();
  }

  public async artifactsToContract(artifacts, address: string = null) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    if (address) {
      artifacts.address = address;
    }
    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;

  }

  public mineBlock() {
    this.web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0}, (e,r) => {});
  }

  public async sendTransaction(data: any, callback = null) {
    try {
      const transaction = await this.web3.eth.sendTransaction(data);
      if (callback && transaction) {
        let txHash = transaction.transactionHash? transaction.transactionHash : transaction.toString();
        this.store.dispatch(new Web3Actions.TransactionSubscribe(new Transaction(txHash, callback)))
      }
      return transaction ? {transaction} : {error: 'Transaction failed!'};
    } catch (e) {
      let error = e && e.message? e.message:e;
      return {error};
    }
  }

  public async sendContractTransaction(contractMethod, args, callback = null) {
    try {
      const transaction = await contractMethod.sendTransaction(...args);
      if (callback && transaction) {
        let txHash = transaction.transactionHash? transaction.transactionHash : transaction.toString();
        this.store.dispatch(new Web3Actions.TransactionSubscribe(new Transaction(txHash, callback)))
      }
      return transaction ? {transaction} : {error: 'Transaction failed!'};
    } catch (e) {
      let error = e && e.message? e.message:e;
      return {error};
    }
  }

  public async callContract(contractMethod, args) {
    try {
      return await contractMethod.call(...args);
    } catch (e) {
      let error = e && e.message? e.message:e;
      return {error};
    }
  }

  getEthBalance(address: string) {
    return this.web3.eth.getBalance(address);
  }

  getAccounts() {
    return this.web3.eth.getAccounts();
  }

  public async getEvents(contractEvent, currentBlock = 0, searchThreshold = 0, filters = {}) {
    let startBlock = currentBlock - searchThreshold;
    if (startBlock < 0) {
      startBlock = 0;
    }
    return new Promise((resolve) => {
      contractEvent(filters, { fromBlock: startBlock, toBlock: currentBlock }).get((error, data) => {
        if (error) {
          return resolve({error});
        }
        return resolve({data});
      })
    })
  }

}
