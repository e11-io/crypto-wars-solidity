import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { BuildingsQueueActions } from './buildings-queue.actions';
import { BuildingsActions } from '../buildings/buildings.actions';
import { Web3Actions } from '../web3/web3.actions';
import { Web3Service } from '../../app/shared/services/web3.service';


@Injectable()
export class BuildingsQueueEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch: false}) getBuildingsQueue$ = this.actions$
    .ofType(BuildingsQueueActions.Types.GET_BUILDINGS_QUEUE)
    .do((action: BuildingsQueueActions.GetBuildingsQueue) => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.callContract(
        this.contractsService.BuildingsQueueInstance.getBuildings,
        [activeAccount, {from: activeAccount}]
      ).then((data) => {
        if (data.error) {
          return this.store.dispatch(new BuildingsQueueActions.GetBuildingsQueueFailure(data.error));
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
        return this.store.dispatch(new BuildingsQueueActions.GetBuildingsQueueSuccess(buildings));
      })
    })

  @Effect({dispatch: false}) addBuildingToQueue$ = this.actions$
    .ofType(BuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE)
    .do((action: BuildingsQueueActions.AddBuildingToQueue) => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.sendContractTransaction(
        this.contractsService.BuildingsQueueInstance.addNewBuildingToQueue,
        [action.payload, {from: activeAccount}],
        (error, data) => {
          if (error) {
            return this.store.dispatch(new BuildingsQueueActions.AddBuildingToQueueFailure(action.payload, error));
          }
          return this.store.dispatch(new BuildingsQueueActions.AddBuildingToQueueSuccess(action.payload));
        }
      ).then((result: any) => {
        if (result.error) {
          return this.store.dispatch(new BuildingsQueueActions.AddBuildingToQueueFailure(action.payload, result.error));
        }
      })
    })

  @Effect({dispatch: false}) upgradeBuilding$ = this.actions$
    .ofType(BuildingsQueueActions.Types.UPGRADE_BUILDING)
    .do((action: BuildingsQueueActions.UpgradeBuilding) => {
      let activeAccount: string = '';
      this.store.select(s => s.web3State).take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.sendContractTransaction(
        this.contractsService.BuildingsQueueInstance.upgradeBuilding,
        [action.payload.id, action.payload.nextLevelId, action.payload.index, {from: activeAccount}],
        (error, data) => {
          if (error) {
            return this.store.dispatch(new BuildingsQueueActions.UpgradeBuildingFailure(action.payload.id, error));
          }
          return this.store.dispatch(new BuildingsQueueActions.UpgradeBuildingSuccess(action.payload.id));
        }
      ).then((tx: any) => {
        if (tx.error) {
          return this.store.dispatch(new BuildingsQueueActions.UpgradeBuildingFailure(action.payload.id, tx.error));
        }
      })
    })

  @Effect({dispatch: false}) cancelBuilding$ =  this.actions$
    .ofType(BuildingsQueueActions.Types.CANCEL_BUILDING)
    .do((action: BuildingsQueueActions.CancelBuilding) => {
      let index;
      let activeAccount
      this.store.select(s => s).take(1).subscribe(state => {
        activeAccount = state.web3State.activeAccount;
        if (action.payload > 2000) {
          index = state.buildingsState.buildings.find(b => b.id == action.payload - 1000).index;
        } else {
          index = state.buildingsState.buildings.find(b => b.id == action.payload).index;
        }

      })

      this.web3Service.sendContractTransaction(
        this.contractsService.BuildingsQueueInstance.cancelBuilding,
        [action.payload, index, {from: activeAccount}]
      )
    })


}
