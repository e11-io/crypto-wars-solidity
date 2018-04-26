import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { AssetsBuildingsQueueActions } from './buildings-queue.actions';

import { ContractsService } from '../../../shared/contracts.service';
import { Status } from '../../../shared/status.model';

import { Web3Actions } from '../../../web3/web3.actions';
import { Web3Service } from '../../../web3/web3.service';



@Injectable()
export class AssetsBuildingsQueueEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch: false}) getBuildingsQueue$ = this.actions$
    .ofType(AssetsBuildingsQueueActions.Types.GET_BUILDINGS_QUEUE)
    .do((action: AssetsBuildingsQueueActions.GetBuildingsQueue) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.callContract(
        this.contractsService.BuildingsQueueInstance.getBuildings,
        [activeAccount, {from: activeAccount}]
      ).then((data) => {
        if (data.error) {
          return this.store.dispatch(new AssetsBuildingsQueueActions.GetBuildingsQueueFailure({
            status: new Status({ error: data.error })
          }));
        }
        let buildings = [];
        for (var i = 0; i < data[0].length; i++) {
          buildings.push({
            id: data[0][i].toNumber(),
            startBlock: data[1][i].toNumber(),
            endBlock: data[2][i].toNumber(),
            index: data[3][i].toNumber()
          });
        }
        return this.store.dispatch(new AssetsBuildingsQueueActions.GetBuildingsQueueSuccess(buildings));
      })
    })

  @Effect({dispatch: false}) addBuildingToQueue$ = this.actions$
    .ofType(AssetsBuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE)
    .do((action: AssetsBuildingsQueueActions.AddBuildingToQueue) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.sendContractTransaction(
        this.contractsService.BuildingsQueueInstance.addNewBuildingToQueue,
        [action.payload, {from: activeAccount}],
        (error, data) => {
          if (error) {
            return this.store.dispatch(new AssetsBuildingsQueueActions.AddBuildingToQueueFailure({
              id: action.payload,
              status: new Status(error)
            }));
          }
          return this.store.dispatch(new AssetsBuildingsQueueActions.AddBuildingToQueueSuccess(action.payload));
        }
      ).then((result: any) => {
        if (result.error) {
          return this.store.dispatch(new AssetsBuildingsQueueActions.AddBuildingToQueueFailure({
            id: action.payload,
            status: new Status({ error: result.error })
          }));
        }
      })
    })

  @Effect({dispatch: false}) upgradeBuilding$ = this.actions$
    .ofType(AssetsBuildingsQueueActions.Types.UPGRADE_BUILDING)
    .do((action: AssetsBuildingsQueueActions.UpgradeBuilding) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.sendContractTransaction(
        this.contractsService.BuildingsQueueInstance.upgradeBuilding,
        [action.payload.id, action.payload.nextLevelId, action.payload.index, {from: activeAccount}],
        (error, data) => {
          if (error) {
            return this.store.dispatch(new AssetsBuildingsQueueActions.UpgradeBuildingFailure({
              id: action.payload.id,
              status: new Status({error})
            }));
          }
          return this.store.dispatch(new AssetsBuildingsQueueActions.UpgradeBuildingSuccess(action.payload.id));
        }
      ).then((tx: any) => {
        if (tx.error) {
          return this.store.dispatch(new AssetsBuildingsQueueActions.UpgradeBuildingFailure({
            id: action.payload.id,
            status: new Status({error: tx.error})
          }));
        }
      })
    })

  @Effect({dispatch: false}) cancelBuilding$ =  this.actions$
    .ofType(AssetsBuildingsQueueActions.Types.CANCEL_BUILDING)
    .do((action: AssetsBuildingsQueueActions.CancelBuilding) => {
      let index;
      let activeAccount
      this.store.select(s => s).take(1).subscribe(state => {
        activeAccount = state.web3.activeAccount;
        if (action.payload > 2000) {
          index = state.app.buildingsList.find(b => b.id == action.payload - 1000).index;
        } else {
          index = state.app.buildingsList.find(b => b.id == action.payload).index;
        }

      })

      this.web3Service.sendContractTransaction(
        this.contractsService.BuildingsQueueInstance.cancelBuilding,
        [action.payload, index, {from: activeAccount}]
      )
    })


}
