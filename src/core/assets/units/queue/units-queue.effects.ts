import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { AssetsUnitsQueueActions } from './units-queue.actions';

import { ContractsService } from '../../../shared/contracts.service';
import { Status } from '../../../shared/status.model';

import { Web3Actions } from '../../../web3/web3.actions';
import { Web3Service } from '../../../web3/web3.service';
import { PlayerResourcesActions } from '../../../player/resources/player-resources.actions';


@Injectable()
export class AssetsUnitsQueueEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch: false}) getUnitsQueue$ = this.actions$
    .ofType(AssetsUnitsQueueActions.Types.GET_UNITS_QUEUE)
    .do((action: AssetsUnitsQueueActions.GetUnitsQueue) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      this.web3Service.callContract(
        this.contractsService.UnitsQueueInstance.getUnits,
        [activeAccount, {from: activeAccount}]
      ).then((data) => {
        if (data.error) {
          return this.store.dispatch(new AssetsUnitsQueueActions.GetUnitsQueueFailure({
            status: new Status({ error: data.error })
          }));
        }
        let units = [];
        for (var i = 0; i < data[0].length; i++) {
          units.push({
            id: data[0][i].toNumber(),
            quantity: data[1][i].toNumber(),
            startBlock: data[2][i].toNumber(),
            endBlock: data[3][i].toNumber(),
          });
        }
        return this.store.dispatch(new AssetsUnitsQueueActions.GetUnitsQueueSuccess(units));
      })
    })

  @Effect({dispatch: false}) addUnitToQueue$ = this.actions$
    .ofType(AssetsUnitsQueueActions.Types.ADD_UNIT_TO_QUEUE)
    .do((action: AssetsUnitsQueueActions.AddUnitToQueue) => {
      let activeAccount: string = '';
      let unitsMap: any;
      this.store.select(s => s).take(1).subscribe(state => {
        activeAccount = state.web3.activeAccount;
        unitsMap = state.assets.units.data.listMap;
      });
      let unit = Object.assign({}, unitsMap[action.payload.id], { price: unitsMap[action.payload.id].price * action.payload.quantity})
      this.store.dispatch(new PlayerResourcesActions.LockPlayerResources(unit));

      this.web3Service.sendContractTransaction(
        this.contractsService.UnitsQueueInstance.addUnitsToQueue,
        [action.payload.id, action.payload.quantity, {from: activeAccount}],
        (error, data) => {
          this.store.dispatch(new PlayerResourcesActions.UnlockPlayerResources(unit));
          if (error) {
            return this.store.dispatch(new AssetsUnitsQueueActions.AddUnitToQueueFailure({
              id: action.payload.id,
              status: new Status(error)
            }));
          }
          return this.store.dispatch(new AssetsUnitsQueueActions.AddUnitToQueueSuccess(action.payload));
        }
      ).then((result: any) => {
        if (result.error) {
          this.store.dispatch(new PlayerResourcesActions.UnlockPlayerResources(unit));
          this.store.dispatch(new AssetsUnitsQueueActions.AddUnitToQueueFailure({
            id: action.payload.id,
            status: new Status({ error: result.error })
          }));
        }
      })
    })


}
