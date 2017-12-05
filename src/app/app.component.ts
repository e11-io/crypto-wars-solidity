import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/skip';
import 'rxjs/add/observable/combineLatest';

import { ContractsService } from './services/contracts.service';
import { Web3Service } from './services/web3.service';

import ExperimentalTokenContract from '../../build/contracts/ExperimentalToken.json'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  accounts: string[];

  account: any;
  ethBalance: any;
  e11Balance: any;
  section: string = 'village';
  status: any;

  constructor(private contracts: ContractsService,
              private web3Service: Web3Service) {
  }

  ngOnInit(): void {
    this.contracts.init((error: string) => {
      if (error) {
        console.log('contract init error');
        console.log(error);
        return;
      }
      this.watchAccount();
    });
  }

  watchAccount() {
    Observable.combineLatest(
      this.web3Service.accounts$.skip(1),
      this.web3Service.lastBlock$.skip(1)
    ).subscribe((data) => {
      let accounts = data[0];
      let lastBlock = data[1];
      this.accounts = accounts;
      this.account = accounts[0];
      console.log('lastBlock:' + lastBlock);
      this.refreshBalance();
    });
  }

  async refreshBalance() {
    console.log('Refreshing balance');

    try {
      this.web3Service.web3.eth.getBalance(this.account).then(ethBalance =>
        this.ethBalance = ethBalance / Math.pow(10, 18)
      );

      const experimentalTokenBalance = await this.contracts.ExperimentalTokenInstance.balanceOf.call(this.account, {from: this.account});
      const experimentalTokenDecimals = await this.contracts.ExperimentalTokenInstance.decimals.call();
      this.e11Balance = experimentalTokenBalance / Math.pow(10, experimentalTokenDecimals);
    } catch (e) {
      console.log(e);
      this.status = 'Error getting balance; see log.';
    }
  }

  mineBlock() {
    this.web3Service.mineBlock();
  }

  clickAddress(account) {
    this.account = account;
    this.refreshBalance();
  }

  changeSection(section) {
    this.section = section;
  }

}
