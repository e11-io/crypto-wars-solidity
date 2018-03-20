import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { UserBuildingsActions } from './user-buildings.actions';
import { BuildingsActions } from '../buildings/buildings.actions';
import { Web3Actions } from '../web3/web3.actions';
import { Web3Service } from '../../app/shared/services/web3.service';
import { UserBuildingsService } from '../../app/shared/services/user-buildings.service';


@Injectable()
export class UserBuildingsEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService,
              private userBuildingsService: UserBuildingsService) {
  }


  @Effect({dispatch: false}) getUserBuildingsLength$ = this.actions$
    .ofType(UserBuildingsActions.Types.GET_USER_BUILDINGS_LENGTH)
    .do((action) => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      return this.web3Service.callContract(
        this.contractsService.UserBuildingsInstance.getUserBuildings,
        [activeAccount, {from: activeAccount}]
      ).then((result) => {
        if (result.error) {
          return this.store.dispatch(new UserBuildingsActions.GetUserBuildingsLengthFailure(result.error));
        }
        if (result.length === 0) {
          return this.store.dispatch(new UserBuildingsActions.GetUserBuildingsSuccess([]));
        }
        return this.store.dispatch(new UserBuildingsActions.GetUserBuildings(result.length))
      })
    })

  @Effect({dispatch: false}) getUserBuildings$ = this.actions$
    .ofType(UserBuildingsActions.Types.GET_USER_BUILDINGS)
    .switchMap((action: UserBuildingsActions.GetUserBuildings) => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });

      return this.userBuildingsService.getUserBuildings(activeAccount, action.payload)
        .map((result: any) => {
          if (result.error) {
            return this.store.dispatch(new UserBuildingsActions.GetUserBuildingsFailure(result.error));
          }
          return this.store.dispatch(new UserBuildingsActions.GetUserBuildingsSuccess(result));
        })
    })

}
