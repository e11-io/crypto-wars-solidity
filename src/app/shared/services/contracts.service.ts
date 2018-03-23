import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { environment } from '../../../environments/environment';
import { Web3Service } from './web3.service';
import getWeb3 from '../util/get-web3';

import AssetsRequirementsContract from '../../../assets/contracts/AssetsRequirements.json';
import AssetsRequirementsContractLocal from '../../../../build/contracts/AssetsRequirements.json';
import BuildingsDataContract from '../../../assets/contracts/BuildingsData.json';
import BuildingsDataContractLocal from '../../../../build/contracts/BuildingsData.json';
import BuildingsQueueContract from '../../../assets/contracts/BuildingsQueue.json';
import BuildingsQueueContractLocal from '../../../../build/contracts/BuildingsQueue.json';
import ExperimentalTokenContract from '../../../assets/contracts/ExperimentalToken.json';
import ExperimentalTokenContractLocal from '../../../../build/contracts/ExperimentalToken.json';
import UserBuildingsContract from '../../../assets/contracts/UserBuildings.json';
import UserBuildingsContractLocal from '../../../../build/contracts/UserBuildings.json';
import UserResourcesContract from '../../../assets/contracts/UserResources.json';
import UserResourcesContractLocal from '../../../../build/contracts/UserResources.json';
import UserVaultContract from '../../../assets/contracts/UserVault.json';
import UserVaultContractLocal from '../../../../build/contracts/UserVault.json';
import UserVillageContract from '../../../assets/contracts/UserVillage.json';
import UserVillageContractLocal from '../../../../build/contracts/UserVillage.json';

declare let window: any;

@Injectable()
export class ContractsService {
  public initialized = false;
  public error = '';

  public AssetsRequirements: any;
  public AssetsRequirementsInstance: any;
  public BuildingsData: any;
  public BuildingsDataInstance: any;
  public BuildingsQueue: any;
  public BuildingsQueueInstance: any;
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

  }

  init() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.
    return new Promise((resolve, reject) => {
      // Initialize contracts once web3 provided.
      this.initContracts((error: string) => {
        this.initialized = true;
        this.error = error;
        resolve(error);
      }).catch(e => {
        resolve(e);
      });
    });
  }

  async initContracts(callback: any) {
    let error = null;
    try {
      const contracts = environment.remoteContracts ? [
        AssetsRequirementsContract,
        BuildingsDataContract,
        BuildingsQueueContract,
        ExperimentalTokenContract,
        UserBuildingsContract,
        UserResourcesContract,
        UserVaultContract,
        UserVillageContract,
      ] : [
        AssetsRequirementsContractLocal,
        BuildingsDataContractLocal,
        BuildingsQueueContractLocal,
        ExperimentalTokenContractLocal,
        UserBuildingsContractLocal,
        UserResourcesContractLocal,
        UserVaultContractLocal,
        UserVillageContractLocal,
      ];

      for (let i = 0; i < contracts.length; i++) {
        const name = contracts[i].contractName;
        await this.web3Service.artifactsToContract(contracts[i], environment.contracts[name])
          .then((ContractAbstraction) => this[name] = ContractAbstraction);
        this[name].defaults({gasPrice: 1000000000});
        this[`${name}Instance`] = await this[name].deployed();
      }
    } catch (e) {
      error = e;
      if (error.message && error.message.indexOf('Failed to fetch') != -1) {
        error = 'failed_to_fetch';
      }
    } finally {
      callback(error);
    }

  }

}
