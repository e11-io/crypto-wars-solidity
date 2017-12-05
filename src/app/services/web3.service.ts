import { Injectable } from '@angular/core';
import { default as contract } from 'truffle-contract';
import { BehaviorSubject } from "rxjs/BehaviorSubject";

import Web3 from 'web3';

import getWeb3 from '../util/get-web3'

declare let window: any;

@Injectable()
export class Web3Service {
  private accounts: string[];
  public accounts$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public lastBlock$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  public web3: Web3;
  public lastBlock: number = 0;

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then((results: any) => {
      this.web3 = results.web3;
      // Instantiate contract once web3 provided. Witha  delay to avoid colission
      setInterval(() => {
        this.web3.eth.getBlockNumber((e, blockNumber) => {
          if (this.lastBlock < blockNumber) {
            this.lastBlock = blockNumber;
            this.lastBlock$.next(blockNumber);
            this.newBlock();
          }
        })
      }, 250);
    }).catch(() => {
      console.log('Error finding web3.');
    });
  }

  newBlock() {
    this.refreshAccounts();
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

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accounts) => {
      if (err != null) {
        console.log('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accounts.length === 0) {
        console.log('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accounts.length || this.accounts[0] !== accounts[0]) {
        this.accounts$.next(accounts);
        this.accounts = accounts;
      }
    });
  }
}
