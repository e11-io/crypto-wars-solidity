import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { UserActions } from './user.actions';
import { Web3Actions } from '../web3/web3.actions';
import { Web3Service } from '../../app/shared/services/web3.service';
import { ContractsService } from '../../app/shared/services/contracts.service';
import { of } from 'rxjs/observable/of';

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class UserEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch: false}) getBalances$ = this.actions$
    .ofType(Web3Actions.Types.SET_ACTIVE_ACCOUNT)
    .do((action: UserActions.GetEthBalance) => {
      let activeAccount: string;
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      if (!activeAccount) {
        return;
      }
      this.store.dispatch(new UserActions.GetEthBalance(activeAccount));
      this.store.dispatch(new UserActions.GetE11Balance(activeAccount));
    });

  @Effect({dispatch: false}) getEthBalance$ = this.actions$
    .ofType(UserActions.Types.GET_ETH_BALANCE)
    .do((action: UserActions.GetEthBalance) => {
      this.web3Service.getEthBalance(action.payload)
        .then((ethBalance: any) => this.store.dispatch(new UserActions.GetEthBalanceSuccess(ethBalance)))
        .catch((e) => this.store.dispatch(new UserActions.GetEthBalanceFailure(e)));
    });

  @Effect({dispatch: false}) getE11Balance$ = this.actions$
    .ofType(UserActions.Types.GET_E11_BALANCE)
    .do((action: UserActions.GetE11Balance) => {
      this.contractsService.ExperimentalTokenInstance.balanceOf.call(action.payload, {from: action.payload})
        .then((e11Balance: any) => this.store.dispatch(new UserActions.GetE11BalanceSuccess(e11Balance)))
        .catch((e) => this.store.dispatch(new UserActions.GetE11BalanceFailure(e)));
    });

}
