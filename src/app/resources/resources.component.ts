import { Component, Input, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';

import { Web3Service } from '../services/web3.service';
import { ContractsService } from '../services/contracts.service';

import BuildingsMock from '../../../mocks/buildings.json';

const ether = Math.pow(10, 18);

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.css']
})
export class ResourcesComponent implements OnInit {
  @Input() account: any;
  @Input() balance: any;

  accounts: string[];

  model = {
    amount: 5,
    receiver: ''
  };

  buildingsData = [];
  payoutAddress: string = '';
  status = '';
  userBuildings = [];
  userResources: any = {};

  constructor(private contracts: ContractsService,
              private web3Service: Web3Service) {
  }

  ngOnInit(): void {

  }

  setStatus(status) {
    this.status = status;
    console.log('status: ' + status);
  }

  async getResources() {
    console.log('Getting Resources of ' + this.account);

    try {
      const transaction = await this.contracts.UserResourcesInstance.getUserResources.call(this.account, {from: this.account});

      if (!transaction) {
        console.log('User has no resources');
        return false;
      } else {
        console.log('User resources');
        let gold = transaction[0];
        let crystal = transaction[1];
        let dust = transaction[2];
        console.log('gold: ' + gold.toNumber());
        console.log('crystal: ' + crystal.toNumber());
        console.log('dust: ' + dust.toNumber());
        return true;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting resources; see log.');
    }
  }
  async getUserPayoutBlock() {
    console.log('Getting Payout Block of ' + this.account);

    try {
      const transaction = await this.contracts.UserResourcesInstance.getUserPayoutBlock.call(this.account, {from: this.account});

      if (!transaction) {
        console.log('User has no payout block');
        return false;
      } else {
        console.log('User payout block: ' + transaction.toNumber());
        this.web3Service.web3.eth.getBlock('pending').then((block) => {
          console.log('Current block: ' + block.number);
        });
        return true;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting payout block; see log.');
    }
  }

  async payoutResources() {
    let payoutAddress = this.payoutAddress || this.account;
    console.log('Pay Resources to User ' + payoutAddress);

    try {
      const transaction = await this.contracts.UserResourcesInstance.payoutResources.sendTransaction(payoutAddress, {
        from: this.account,
        gas: 200000
      });
      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error paying resources to user; see log.');
    }
  }

  async getUserBuildings() {

    console.log('Getting Buildings of ' + this.account);

    try {
      const transaction = await this.contracts.UserBuildingsInstance.getUserBuildings.call(this.account, {from: this.account});

      if (!transaction) {
        console.log('User has no buildings');
        return false;
      } else {
        console.log('User buildings');
        console.log(transaction);
        let buildingsIds = [];
        if (transaction.length) {
          transaction.forEach(t => {
            buildingsIds.push(t.toNumber());
          });
          this.getBuildingsData(buildingsIds).then(data => {
            this.userBuildings = data;
          });
        }

        return true;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting buildings; see log.');
    }
  }

  async getAllBuildingsData() {

    console.log('Getting All Buildings data');

    try {
      let buildingsLength = await this.contracts.BuildingsDataInstance.getBuildingIdsLength.call({from: this.account})
      buildingsLength = buildingsLength.toNumber();
      let buildingsIds: any = [];
      for (var i = 0; i < buildingsLength; i++) {
        let buildingId = await this.contracts.BuildingsDataInstance.buildingIds.call(i, {from: this.account});
        buildingsIds.push(buildingId.toNumber());
      }

      if (!buildingsIds) {
        console.log('No buildings');
        return false;
      } else {
        console.log('All buildings');
        console.log(buildingsIds);
        this.getBuildingsData(buildingsIds).then(result => {
          this.buildingsData = result;
        });
        return true;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting buildings; see log.');
    }
  }

  async getBuildingsData(buildingsIds: number[]) {

    console.log('Getting Buildings data of ' + buildingsIds);

    try {
      let buildingsData: any = {};
      for (let buildingId of buildingsIds) {
        await this.contracts.BuildingsDataInstance.buildings.call(buildingId, {from: this.account}).then(data => {
          buildingsData[buildingId] = this.parseBuildingData(data);
        });
      };

      if (!buildingsData) {
        console.log('No buildings data');
        return false;
      } else {
        console.log('Buildings Data');
        console.log(buildingsData);
        return buildingsData;
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error getting buildings; see log.');
    }
  }

  parseBuildingData(data) {
    let parsedData: any = {};
    parsedData.name = data[0];
    let properties = BuildingsMock.buildingProperties.stats;
    properties.forEach((property, i) => {
      parsedData[property] = data[i + 1].toNumber();
    })
    return parsedData;
  }
}
