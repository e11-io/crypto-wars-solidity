import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { PlayerBuildingsActions } from './player-buildings.actions';
import { PlayerBuildingsService } from './player-buildings.service';

import { ContractsService } from '../../../shared/contracts.service';
import { Status } from '../../../shared/status.model';

import { Web3Actions } from '../../../web3/web3.actions';
import { Web3Service } from '../../../web3/web3.service';
import { PlayerResourcesActions } from '../../resources/player-resources.actions';

@Injectable()
export class PlayerBuildingsEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private playerBuildingsService: PlayerBuildingsService,
              private web3Service: Web3Service) {
  }


  @Effect({dispatch: false}) getPlayerBuildingsLength$ = this.actions$
    .ofType(PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS_LENGTH)
    .do((action) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      return this.web3Service.callContract(
        this.contractsService.UserBuildingsInstance.getUserBuildings,
        [activeAccount, {from: activeAccount}]
      ).then((result) => {
        if (result.error) {
          return this.store.dispatch(new PlayerBuildingsActions.GetPlayerBuildingsLengthFailure({
            status: new Status({ error: result.error })
          }));
        }
        if (result.length === 0) {
          return this.store.dispatch(new PlayerBuildingsActions.GetPlayerBuildingsSuccess([]));
        }
        return this.store.dispatch(new PlayerBuildingsActions.GetPlayerBuildings(result.length))
      })
    })

  @Effect({dispatch: false}) getPlayerBuildings$ = this.actions$
    .ofType(PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS)
    .switchMap((action: PlayerBuildingsActions.GetPlayerBuildings) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      return this.playerBuildingsService.getPlayerBuildings(activeAccount, action.payload)
        .map((result: any) => {
          if (result.error) {
            return this.store.dispatch(new PlayerBuildingsActions.GetPlayerBuildingsFailure({
              status: new Status({ error: result.error })
            }));
          }
          return this.store.dispatch(new PlayerBuildingsActions.GetPlayerBuildingsSuccess(result));
        })
    })

}
