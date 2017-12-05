import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import Web3 from 'web3';

import { Web3Service } from './web3.service';
import getWeb3 from '../util/get-web3'

import BuildingsDataContract     from '../../../build/contracts/BuildingsData.json';
import BuildingsQueueContract    from '../../../build/contracts/BuildingsQueue.json';
import ExperimentalTokenContract from '../../../build/contracts/ExperimentalToken.json';
import UserBuildingsContract     from '../../../build/contracts/UserBuildings.json';
import UserResourcesContract     from '../../../build/contracts/UserResources.json';
import UserVaultContract         from '../../../build/contracts/UserVault.json';
import UserVillageContract       from '../../../build/contracts/UserVillage.json';

/* LATEST MIGRATION TO e11 311
  Migrations:         0x38ca16214f1d048c1adbb24accbeec45d514158c
  ExperimentalToken:  0x50787dda82ecfff95054afb4051a2f7518c49e29
  SimpleToken:        0x00bc5224cdffd60699ca6dd1e0170b46a73864fd
  UserVault:          0x83ffc18451ffa7b467df8919a5dda53991b708d5
  UserResources:      0x9d3c1c38510689a0096204b15cb8b072f05286fd
  BuildingsData:      0x5bb173ca24da1a0b19167681b14a6df33b0c6cd4
  UserBuildings:      0x551c13042fbdbb689f398bb1f0cbc74fbcb1eca5
  UserVillage:        0x71461ff3a26dd5f3db7216bb2b578feb5bfdb24a
  BuildingsQueue:     0xd60f545f6395865919be21782890bfaea534e7bf
*/
declare let window: any;

@Injectable()
export class ContractsService {
  public initialized: boolean = false;
  public error: string = '';

  public BuildingsData: any;
  public BuildingsDataAddress: string = '0x5bb173ca24da1a0b19167681b14a6df33b0c6cd4';
  public BuildingsDataInstance: any;
  public BuildingsQueue: any;
  public BuildingsQueueAddress: string = '0xd60f545f6395865919be21782890bfaea534e7bf';
  public BuildingsQueueInstance: any;
  public ExperimentalToken: any;
  public ExperimentalTokenAddress: string = '0x50787dda82ecfff95054afb4051a2f7518c49e29';
  public ExperimentalTokenInstance: any;
  public UserBuildings: any;
  public UserBuildingsAddress: string = '0x551c13042fbdbb689f398bb1f0cbc74fbcb1eca5';
  public UserBuildingsInstance: any;
  public UserResources: any;
  public UserResourcesAddress: string = '0x9d3c1c38510689a0096204b15cb8b072f05286fd';
  public UserResourcesInstance: any;
  public UserVault: any;
  public UserVaultAddress: string = '0x83ffc18451ffa7b467df8919a5dda53991b708d5';
  public UserVaultInstance: any;
  public UserVillage: any;
  public UserVillageAddress: string = '0x71461ff3a26dd5f3db7216bb2b578feb5bfdb24a';
  public UserVillageInstance: any;

  constructor(private web3Service: Web3Service) {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
  }

  public bootstrapWeb3() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3.then((results: any) => {
      // Initialize contracts once web3 provided.
      this.initContracts((error: string) => {
        this.initialized = true;
        this.error = error;
      });
    }).catch(() => {
      console.log('Error finding web3.');
    });

  }

  init(callback: any, retries: number = 0) {
    if (retries > 10) {
      return;
    }
    if (this.initialized) {
      return callback(this.error);
    }
    setTimeout(() => {
      return this.init(callback, retries++);
    }, 100);
  }

  async initContracts(callback: any) {
    let error = null;
    try {
      let contracts = [
        BuildingsDataContract,
        BuildingsQueueContract,
        ExperimentalTokenContract,
        UserBuildingsContract,
        UserResourcesContract,
        UserVaultContract,
        UserVillageContract,
      ];
      for (var i = 0; i < contracts.length; i++) {
        let name = contracts[i].contractName;
        await this.web3Service.artifactsToContract(contracts[i], this[`${name}Address`])
          .then((ContractAbstraction) => this[name] = ContractAbstraction);
        this[name].defaults({gasPrice: 1000000000});
        this[`${name}Instance`] = await this[name].deployed();
      }
    } catch (e) {
      error = e;
    } finally {
      callback(error);
    }

  }

}
