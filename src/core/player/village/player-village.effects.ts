import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { PlayerVillageActions } from './player-village.actions';

import { AssetsBuildingsQueueActions } from '../../assets/buildings/queue/buildings-queue.actions';
import { AssetsUnitsQueueActions } from '../../assets/units/queue/units-queue.actions';
import { PlayerBuildingsActions } from '../assets/buildings/player-buildings.actions';
import { PlayerResourcesActions } from '../resources/player-resources.actions';
import { PlayerUnitsActions } from '../assets/units/player-units.actions';

import { ContractsService } from '../../shared/contracts.service';
import { Status } from '../../shared/status.model';

import { Web3Actions } from '../../web3/web3.actions';
import { Web3Service } from '../../web3/web3.service';

declare let window: any;

@Injectable()
export class PlayerVillageEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch:false}) getVillageName =  this.actions$
    .ofType(PlayerVillageActions.Types.GET_VILLAGE_NAME)
    .do((action: PlayerVillageActions.GetVillageName) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      })

      this.web3Service.callContract(
        this.contractsService.UserVillageInstance.villages,
        [ action.payload, {from: activeAccount} ]
      ).then((result) => {
        if (result.error) {
          return this.store.dispatch(new PlayerVillageActions.GetVillageNameFailure({
            status: new Status({ error: result.error })
          }));
        }
        if (result.toString() === '') {
          return this.store.dispatch(new PlayerVillageActions.GetVillageNameFailure({
            status: new Status({ error: 'player_has_no_village' })
          }));
        }
        return this.store.dispatch(new PlayerVillageActions.GetVillageNameSuccess(result.toString()));
      })
    })

  @Effect({dispatch:false}) getUserPoints =  this.actions$
    .ofType(PlayerVillageActions.Types.GET_USER_POINTS)
    .map((action: PlayerVillageActions.GetUserPoints) => {
      this.web3Service.callContract(
        this.contractsService.PointsSystemInstance.usersPoints,
        [action.payload]
      ).then((result) => {
        if (result.error) {
          return this.store.dispatch(new PlayerVillageActions.GetUserPointsFailure({
            status: new Status({ error: result.error })
          }));
        }
        return this.store.dispatch(new PlayerVillageActions.GetUserPointsSuccess(result));
      })
    })

  @Effect() getVillageNameSuccess$ = this.actions$
    .ofType(PlayerVillageActions.Types.GET_VILLAGE_NAME_SUCCESS)
    .mergeMap((action: PlayerVillageActions.GetVillageNameSuccess) => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      })
      return Observable.from([
        new AssetsBuildingsQueueActions.GetBuildingsQueue(activeAccount),
        new PlayerBuildingsActions.GetPlayerBuildingsLength(),
        new AssetsUnitsQueueActions.GetUnitsQueue(activeAccount),
        new PlayerUnitsActions.GetPlayerUnits(),
      ])
    });

  @Effect({dispatch: false}) createVillage$ = this.actions$
    .ofType(PlayerVillageActions.Types.CREATE_VILLAGE)
    .do((action: PlayerVillageActions.CreateVillage) => {
      const ether = Math.pow(10, 18);
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      })

      this.web3Service.callContract(
        this.contractsService.ExperimentalTokenInstance.allowance,
        [ activeAccount, this.contractsService.UserVaultInstance.address, {from: activeAccount} ]
      ).then((allowed: any) => {
        if (allowed.error) {

        }

        if (allowed.toNumber() / ether > 0) {
          this.web3Service.sendContractTransaction(
            this.contractsService.UserVillageInstance.create,
            [ action.payload.village, action.payload.name, {from: activeAccount} ],
            (error, data) => {
              if (error) {
                return this.store.dispatch(new PlayerVillageActions.CreateVillageFailure({
                  status: new Status({ error })
                }));
              }
              return this.store.dispatch(new PlayerVillageActions.CreateVillageSuccess());
            }
          )
          return;
        }

        this.web3Service.sendContractTransaction(
          this.contractsService.ExperimentalTokenInstance.approve,
          [ this.contractsService.UserVaultInstance.address, 1 * ether, {from: activeAccount} ]
        ).then((result: any) => {
          if (result.error) {
            return this.store.dispatch(new PlayerVillageActions.CreateVillageFailure({
              status: new Status({ error: result.error })
            }));
          }

          this.web3Service.sendContractTransaction(
            this.contractsService.UserVillageInstance.create,
            [ action.payload.village, action.payload.name, {from: activeAccount} ],
            (error, data) => {
              if (error) {
                return this.store.dispatch(new PlayerVillageActions.CreateVillageFailure({
                  status: new Status({ error })
                }));
              }
              return this.store.dispatch(new PlayerVillageActions.CreateVillageSuccess());
            }
          ).then((result: any) => {
            if (result.error) {
              return this.store.dispatch(new PlayerVillageActions.CreateVillageFailure({
                status: new Status({ error: result.error })
              }));
            }
          })
        })
      })
    })

  @Effect({dispatch: false}) createVillageSuccess$ = this.actions$
    .ofType(PlayerVillageActions.Types.CREATE_VILLAGE_SUCCESS)
    .do(action => {
      window.location.reload();
    })








}
