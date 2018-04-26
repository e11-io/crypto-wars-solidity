import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { PlayerTokensActions } from './player-tokens.actions';

import { ContractsService } from '../../shared/contracts.service';
import { Status } from '../../shared/status.model';
import { Web3Actions } from '../../web3/web3.actions';
import { Web3Service } from '../../web3/web3.service';

@Injectable()
export class PlayerTokensEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch: false}) getBalances$ = this.actions$
    .ofType(Web3Actions.Types.SET_ACTIVE_ACCOUNT)
    .do((action: PlayerTokensActions.GetEthBalance) => {
      let activeAccount: string;
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      if (!activeAccount) {
        return;
      }
      this.store.dispatch(new PlayerTokensActions.GetEthBalance(activeAccount));
      this.store.dispatch(new PlayerTokensActions.GetE11Balance(activeAccount));
    });

  @Effect({dispatch: false}) getEthBalance$ = this.actions$
    .ofType(PlayerTokensActions.Types.GET_ETH_BALANCE)
    .do((action: PlayerTokensActions.GetEthBalance) => {
      this.web3Service.getEthBalance(action.payload)
        .then((ethBalance: any) => this.store.dispatch(new PlayerTokensActions.GetEthBalanceSuccess(ethBalance)))
        .catch((e) => this.store.dispatch(new PlayerTokensActions.GetEthBalanceFailure({
          status: new Status({ error: e })
        })));
    });

  @Effect({dispatch: false}) getE11Balance$ = this.actions$
    .ofType(PlayerTokensActions.Types.GET_E11_BALANCE)
    .do((action: PlayerTokensActions.GetE11Balance) => {
      this.contractsService.ExperimentalTokenInstance.balanceOf.call(action.payload, {from: action.payload})
        .then((e11Balance: any) => this.store.dispatch(new PlayerTokensActions.GetE11BalanceSuccess(e11Balance)))
        .catch((e) => this.store.dispatch(new PlayerTokensActions.GetE11BalanceFailure({
          status: new Status({ error: e })
        })));
    });

}
