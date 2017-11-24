import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import Web3 from 'web3';

import { Web3Service } from './web3.service';
import getWeb3 from '../util/get-web3'

import ExperimentalTokenContract from '../../../build/contracts/ExperimentalToken.json';
import BuildingsDataContract from '../../../build/contracts/BuildingsData.json';
import UserBuildingsContract from '../../../build/contracts/UserBuildings.json';
import UserResourcesContract from '../../../build/contracts/UserResources.json';
import UserVaultContract from '../../../build/contracts/UserVault.json';
import UserVillageContract from '../../../build/contracts/UserVillage.json';

declare let window: any;

@Injectable()
export class ContractsService {
  public initialized: boolean = false;

  public BuildingsData: any;
  public BuildingsDataInstance: any;
  public ExperimentalToken: any;
  public ExperimentalTokenInstance: any;
  public UserBuildings: any;
  public UserBuildingsInstance: any;
  public UserResources: any;
  public UserResourcesInstance: any;
  public UserVault: any;
  public UserVaultInstance: any;
  public UserVillage: any;
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
      this.initContracts(() => {
        this.initialized = true;
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
      return callback();
    }
    setTimeout(() => {
      return this.init(callback, retries++);
    }, 100);
  }

  async initContracts(callback: any) {

    await this.web3Service.artifactsToContract(BuildingsDataContract)
      .then((BuildingsDataContractAbstraction) => this.BuildingsData = BuildingsDataContractAbstraction);
    this.BuildingsDataInstance = await this.BuildingsData.deployed();

    await this.web3Service.artifactsToContract(ExperimentalTokenContract)
      .then((ExperimentalTokenAbstraction) => this.ExperimentalToken = ExperimentalTokenAbstraction);
    this.ExperimentalTokenInstance = await this.ExperimentalToken.deployed();

    await this.web3Service.artifactsToContract(UserBuildingsContract)
      .then((UserBuildingsContractAbstraction) => this.UserBuildings = UserBuildingsContractAbstraction);
    this.UserBuildingsInstance = await this.UserBuildings.deployed();

    await this.web3Service.artifactsToContract(UserResourcesContract)
      .then((UserResourcesContractAbstraction) => this.UserResources = UserResourcesContractAbstraction);
    this.UserResourcesInstance = await this.UserResources.deployed();

    await this.web3Service.artifactsToContract(UserVaultContract)
      .then((UserVaultContractAbstraction) => this.UserVault = UserVaultContractAbstraction);
    this.UserVaultInstance = await this.UserVault.deployed();

    await this.web3Service.artifactsToContract(UserVillageContract)
      .then((UserVillageContractAbstraction) => this.UserVillage = UserVillageContractAbstraction);
    this.UserVillageInstance = await this.UserVillage.deployed();

    callback();
  }

}
