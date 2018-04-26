import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { CryptoWarsState } from '../app.state';
import { AssetsBuildingsQueueActions } from '../../core/assets/buildings/queue/buildings-queue.actions';
import { Web3Actions } from '../../core/web3/web3.actions';
import { ContractsService } from '../../core/shared/contracts.service';
import { Web3Service } from '../../core/web3/web3.service';

import { AbstractContainerComponent } from '../shared/components/abstract-container.component';
import BigNumber from 'bignumber.js';

const ether = Math.pow(10, 18);

@Component({
  selector: 'e11-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})

export class AdminComponent extends AbstractContainerComponent {

  constructor(public store: Store<CryptoWarsState>,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
    super(store);


    this.addToSubscriptions(
    );

  }

  stopPull() {
    this.store.dispatch(new Web3Actions.StopPull());
  }

  async sendCoin(receiver: string, amount: number) {
    console.log('Sending tokens ' + amount + ' to ' + receiver);
    await this.web3Service.sendContractTransaction(
      this.contractsService.ExperimentalTokenInstance.transfer,
      [ receiver, amount * ether, {from: this.activeAccount} ],
      (error, data) => {
        console.log(error? error : 'token sent!');
      }
    );
  }

  async getVillage() {
    console.log('Getting Village of ' + this.activeAccount);
    const result = await this.web3Service.callContract(
      this.contractsService.UserVillageInstance.villages,
      [ this.activeAccount, {from: this.activeAccount} ]
    );
    console.log(result.error? result : result);

    return result;
  }

  async createVillage(villageName: string, userName: string) {
    villageName = villageName.trim();
    userName = userName.trim();

    //  Check if user already has a village
    let userHasVillage = await this.getVillage();
    if (userHasVillage.error) {
      console.log('stats: ' + userHasVillage.error);
      return;
    }
    if (userHasVillage != '') {
      console.log('stats: User already has a village' + userHasVillage);
      return;
    }
    // Check if user already has a village
    let vaultAllowance: any = await this.getVaultAllowance();
    if (vaultAllowance.error) {
      console.log('Status: ' + vaultAllowance.error);
      return
    }

    if (vaultAllowance.dividedBy(ether).toNumber() >= 1) {
      console.log('Creating Village: ' + villageName + ' by ' + userName);
      await this.web3Service.sendContractTransaction(
        this.contractsService.UserVillageInstance.create,
        [ villageName, userName, {from: this.activeAccount} ],
        (error, data) => {
          console.log(error? error : 'village created!');
        }
      );
      return;
    }

    console.log('User has not allowed enough tokens to vault contract');
  }

  async getVaultAllowance() {
    console.log('Getting vault allowance of ' + this.activeAccount);
    const result = await this.web3Service.callContract(
      this.contractsService.ExperimentalTokenInstance.allowance,
      [ this.activeAccount, this.contractsService.UserVaultInstance.address, {from: this.activeAccount} ]
    );
    console.log(result.error? result.error : result.toNumber() / Math.pow(10,18));

    return result;

  }

  async approve(amount: number) {
    console.log('Approving ' + amount + ' tokens to User Vault Contract');
    await this.web3Service.sendContractTransaction(
      this.contractsService.ExperimentalTokenInstance.approve,
      [ this.contractsService.UserVaultInstance.address, amount * ether, {from: this.activeAccount} ],
      (error, data) => {
        console.log(error? error : 'token approved!');
      }
    );
  }


  async getLastPayoutBlock() {
    const result = await this.web3Service.callContract(
      this.contractsService.UserResourcesInstance.usersPayoutBlock,
      [this.activeAccount, {from: this.activeAccount}]
    );

    console.log('User ' + this.activeAccount + ' last payout block #' + result);

    return result;
  }

  async getUserBuildings() {
    console.log('Getting building of ' + this.activeAccount);
    let result = await this.web3Service.callContract(
      this.contractsService.UserBuildingsInstance.getUserBuildings,
      [this.activeAccount, {from: this.activeAccount}]
    )

    result = result.map(building => building.toNumber())
    console.log(result);
  }

  async getExistingBuildings() {
    console.log(this.contractsService.BuildingsDataInstance);
    console.log(this.contractsService.BuildingsDataInstance.buildingIds);
    let result = await this.web3Service.callContract(
      this.contractsService.BuildingsDataInstance.buildingIds,
      [1]
    )

    console.log(result);
  }

  async getUserBuildingsQueue() {
    let buildings = await this.web3Service.callContract(
      this.contractsService.BuildingsQueueInstance.getBuildingsInQueue,
      [this.activeAccount, {from: this.activeAccount}]
    )

    buildings = buildings.map(building => building.toNumber())
    console.log(buildings);
  }

  addBuildingToQueue(building: number) {
    console.log('Adding building id ' + building + ' to user ' + this.activeAccount);
    this.store.dispatch(new AssetsBuildingsQueueActions.AddBuildingToQueue(building));
  }

  async checkTransaction() {
    const result = await this.web3Service.web3.eth.getTransactionReceipt(
      '0x604b1494a35aec690dda0a9cb186e2be873bfcd8bc39fe42ddad27482acfc480'
    );

    console.log(result);
  }

  getExistingBuildingsLength() {
    this.web3Service.callContract(
      this.contractsService.BuildingsDataInstance.getBuildingIdsLength,
      [ {from: this.activeAccount} ]
    ).then((result) => {
      console.log(result);
    })

  }

  async getBuildingsInQueueTest() {
    let activeAccount;
    this.store.select('web3').take(1).subscribe(web3 => {
      activeAccount = web3.activeAccount;
    });

    let [ids, startBlocks, endBlocks] = await this.web3Service.callContract(
      this.contractsService.BuildingsQueueInstance.getBuildings,
      [activeAccount, {from: activeAccount}]
    )

    ids = ids.map(id => id.toNumber());
    startBlocks = startBlocks.map(block => block.toNumber());
    endBlocks = endBlocks.map(block => block.toNumber());
    console.log('buildingsInQueue');
    console.log('ids: ' + ids);
    console.log('start block #: ' + startBlocks);
    console.log('end block #: ' + endBlocks);
  }

}
