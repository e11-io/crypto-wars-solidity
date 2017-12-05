import { Component, Input, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';

import { ContractsService } from '../services/contracts.service';
import { Web3Service } from '../services/web3.service';

const ether = Math.pow(10, 18);

@Component({
  selector: 'app-village',
  templateUrl: './village.component.html',
  styleUrls: ['./village.component.css']
})
export class VillageComponent implements OnInit {
  @Input() account: any;
  @Input() balance: any;

  accounts: string[];

  amount: number = 5;
  receiver: string = '';

  status = '';
  userName: string = 'Lucho';
  villageName: string = 'Experimental';

  approveAddress: string = '';
  approveAmount: number = 1;

  constructor(private contracts: ContractsService,
              private web3Service: Web3Service) {
  }

  ngOnInit(): void {
    this.contracts.init((error: boolean) => {
      if (error) return;
      this.approveAddress = this.contracts.UserVaultInstance.address;
    });
  }

  setStatus(status) {
    this.status = status;
    console.log('status: ' + status);
  }

  async sendEther() {
    console.log('Sending ethers' + this.amount + ' to ' + this.receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const transaction = await this.web3Service.web3.eth.sendTransaction({from: this.account, to: this.receiver, value: this.amount * ether});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending ether; see log.');
    }
  }
  async sendCoin() {
    console.log('Sending tokens' + this.amount + ' to ' + this.receiver);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const transaction = await this.contracts.ExperimentalTokenInstance.transfer.sendTransaction(this.receiver, this.amount * ether, {from: this.account});

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async approve() {
    console.log('Approving ' + this.approveAmount * ether + ' tokens to ' + this.approveAddress);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const transaction = await this.contracts.ExperimentalTokenInstance.approve.sendTransaction(
        this.approveAddress,
        this.approveAmount * ether,
        { from: this.account }
      );

      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending coin; see log.');
    }
  }

  async createVillage() {
    //  Check if user already has a village
    let userHasVillage = await this.getVillage();
    if (userHasVillage) {
      this.setStatus('User already has a village');
      return;
    }
    // Check if user already has a village
    let vaultAllowance: any = await this.getVaultAllowance();
    if (vaultAllowance instanceof BigNumber) {
      vaultAllowance = new new BigNumber(vaultAllowance);
      vaultAllowance = vaultAllowance.dividedBy(ether).toNumber()
      console.log('vaultAllowance');
      console.log(vaultAllowance);
      this.setStatus('User has not allowed enough tokens to vault contract');
      return;
    }

    console.log('Creating Village: ' + this.villageName + ' by ' + this.userName);

    this.setStatus('Initiating transaction... (please wait)');
    try {
      const transaction = await this.contracts.UserVillageInstance.create.sendTransaction(
        this.villageName,
        this.userName,
        { from: this.account }
      );

      console.log(transaction);
      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error creating village; see log.');
    }
  }

  async getVillage() {
    console.log('Getting Village of ' + this.account);

    try {
      const transaction = await this.contracts.UserVillageInstance.villages.call(this.account, {from: this.account});

      if (!transaction) {
        console.log('User has no village');
        return false;
      } else {
        console.log('User village');
        console.log(transaction);
        return true;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting village; see log.');
    }
  }

  async getVaultAllowance() {
    console.log('Getting vault allowance of ' + this.account);

    try {
      const transaction = await this.contracts.ExperimentalTokenInstance.allowance.call(
        this.account,
        this.contracts.UserVaultInstance.address,
        { from: this.account }
      );

      if (!transaction) {
        console.log('Vault has no allowance');
        return false;
      } else {
        console.log('Vault has allowance: ' + transaction);
        return transaction;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting vault allowance; see log.');
    }
  }

}
