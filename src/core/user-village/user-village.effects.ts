import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { UserBuildingsActions } from "../user-buildings/user-buildings.actions";
import { UserVillageActions } from './user-village.actions';
import { Web3Actions } from '../web3/web3.actions';
import { Web3Service } from '../../app/shared/services/web3.service';
import { BuildingsQueueActions } from "../buildings-queue/buildings-queue.actions";
import { UserResourcesActions } from "../user-resources/user-resources.actions";

declare let window: any;

@Injectable()
export class UserVillageEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch:false}) getVillageName =  this.actions$
    .ofType(UserVillageActions.Types.GET_VILLAGE_NAME)
    .do((action: UserVillageActions.GetVillageName) => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      })

      this.web3Service.callContract(
        this.contractsService.UserVillageInstance.villages,
        [ action.payload, {from: activeAccount} ]
      ).then((result) => {
        if (result.error) {
          return this.store.dispatch(new UserVillageActions.GetVillageNameFailure(result.error));
        }
        if (result.toString() === '') {
          return this.store.dispatch(new UserVillageActions.GetVillageNameFailure('user_has_no_village'));
        }
        return this.store.dispatch(new UserVillageActions.GetVillageNameSuccess(result.toString()));
      })
    })

  @Effect() getVillageNameSuccess$ = this.actions$
    .ofType(UserVillageActions.Types.GET_VILLAGE_NAME_SUCCESS)
    .mergeMap((action: UserVillageActions.GetVillageNameSuccess) => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      })
      return Observable.from([
        new BuildingsQueueActions.GetBuildingsQueue(activeAccount),
        new UserBuildingsActions.GetUserBuildingsLength(),
        new UserResourcesActions.GetUserResources(),
      ])
    });

  @Effect({dispatch: false}) createVillage$ = this.actions$
    .ofType(UserVillageActions.Types.CREATE_VILLAGE)
    .do((action: UserVillageActions.CreateVillage) => {
      const ether = Math.pow(10, 18);
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
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
                return this.store.dispatch(new UserVillageActions.CreateVillageFailure(error));
              }
              return this.store.dispatch(new UserVillageActions.CreateVillageSuccess());
            }
          )
          return;
        }

        this.web3Service.sendContractTransaction(
          this.contractsService.ExperimentalTokenInstance.approve,
          [ this.contractsService.UserVaultInstance.address, 1 * ether, {from: activeAccount} ]
        ).then((result: any) => {
          if (result.error) {
            return this.store.dispatch(new UserVillageActions.CreateVillageFailure(result.error));
          }

          this.web3Service.sendContractTransaction(
            this.contractsService.UserVillageInstance.create,
            [ action.payload.village, action.payload.name, {from: activeAccount} ],
            (error, data) => {
              if (error) {
                return this.store.dispatch(new UserVillageActions.CreateVillageFailure(error));
              }
              return this.store.dispatch(new UserVillageActions.CreateVillageSuccess());
            }
          ).then((result: any) => {
            if (result.error) {
              return this.store.dispatch(new UserVillageActions.CreateVillageFailure(result.error));
            }
          })
        })
      })
    })

  @Effect({dispatch: false}) createVillageSuccess$ = this.actions$
    .ofType(UserVillageActions.Types.CREATE_VILLAGE_SUCCESS)
    .do(action => {
      window.location.reload();
    })








}
