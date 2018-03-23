import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Web3Service } from '../../app/shared/services/web3.service';
import { ContractsService } from '../../app/shared/services/contracts.service';

import { Web3Actions } from './web3.actions';
import { Web3State } from "./web3.reducer";
import { BuildingsDataActions } from '../buildings-data/buildings-data.actions';
import { BuildingsQueueActions } from '../buildings-queue/buildings-queue.actions';
import { UserActions } from '../user/user.actions';
import { UserBuildingsActions } from '../user-buildings/user-buildings.actions';
import { UserResourcesActions } from '../user-resources/user-resources.actions';
import { UserVillageActions } from "../user-village/user-village.actions";

import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/combineLatest';
import { of } from 'rxjs/observable/of';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Web3Effects {

  constructor(private store: Store<any>,
              private actions$: Actions,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch: false}) bootstrap$ = this.actions$
    .ofType(Web3Actions.Types.BOOTSTRAP)
    .do((action: Web3Actions.Bootstrap): any => {
      this.checkWeb3Service((error) => {
        if (error) {
          this.store.dispatch(new Web3Actions.Web3Error(error));
          return
        }
        return this.store.dispatch(new Web3Actions.BootstrapSuccess());
      })
    });

  @Effect() bootstrapSuccess$ = this.actions$
    .ofType(Web3Actions.Types.BOOTSTRAP_SUCCESS)
    .mergeMap(action =>
      Observable.from([
        new Web3Actions.StartPull(),
        new BuildingsDataActions.GetBuildingsLength()
      ])
    );

  @Effect() bootstrapFailure$ = this.actions$
    .ofType(Web3Actions.Types.BOOTSTRAP_RETRY)
    .delay(5000)
    .map((action: Web3Actions.BootstrapRetry) => {
      return new Web3Actions.Bootstrap();
    });

  @Effect({dispatch: false}) getBlockNumber$ = this.actions$
    .ofType(Web3Actions.Types.GET_BLOCK_NUMBER)
    .do(action => {
      this.web3Service.getBlockNumber().then((blockNumber: any) => {
        let newBlock = false;
        this.store.select(store => store.web3State.lastBlock).take(1)
          .subscribe(lastBlockNumber => {
            newBlock = (lastBlockNumber < blockNumber);
          });
        if (newBlock) {
          this.store.dispatch(new Web3Actions.GetBlockNumberSuccess(blockNumber));
        }
      }).catch(e => this.store.dispatch(new Web3Actions.GetBlockNumberFailure(e)));
    });

  @Effect({dispatch: false}) getBlockNumberSuccess$ = this.actions$
    .ofType(Web3Actions.Types.GET_BLOCK_NUMBER_SUCCESS)
    .do(() => {
      let activeAccount: string = '';
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      let hasVillage: boolean = false;
      this.store.select('userVillageState').take(1).subscribe(userVillageState => {
        hasVillage = !!userVillageState.villageName;
      })
      if (hasVillage) {
        this.store.dispatch(new UserBuildingsActions.GetUserBuildingsLength());
        this.store.dispatch(new UserResourcesActions.GetUserResources());
        this.store.dispatch(new BuildingsQueueActions.GetBuildingsQueue(activeAccount));
      }
      this.store.dispatch(new UserActions.GetEthBalance(activeAccount));
      this.store.dispatch(new UserActions.GetE11Balance(activeAccount));
      this.store.dispatch(new Web3Actions.TransactionLookup());
    });


  @Effect({dispatch: false}) getAccounts$ = this.actions$
    .ofType(Web3Actions.Types.GET_ACCOUNTS)
    .do(action => {
      this.web3Service.getAccounts()
        .then((accounts: string[]) => this.store.dispatch(new Web3Actions.GetAccountsSucccess(accounts)))
        .catch(e => this.store.dispatch(new Web3Actions.GetAccountsFailure(e)))
    });

  @Effect({dispatch: false}) getAccountsSuccess$ = this.actions$
    .ofType(Web3Actions.Types.GET_ACCOUNTS_SUCCESS)
    .do((action: Web3Actions.GetAccountsSucccess): any => {
      let activeAccount: string;
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      if (activeAccount === action.payload[0]) {
        return;
      }
      if (!activeAccount) {
        this.store.dispatch(new Web3Actions.SetActiveAccount(action.payload[0]));
        this.store.dispatch(new UserVillageActions.GetVillageName(action.payload[0]));
      } else {
        window.location.reload();
      }
    });

  @Effect() proccessPull$ = this.actions$
    .ofType(Web3Actions.Types.PROCCESS_PULL)
    .mergeMap(action =>
      Observable.from([
        new Web3Actions.Web3Check(),
        new Web3Actions.GetAccounts(),
        new Web3Actions.GetBlockNumber(),
      ])
    );

  @Effect() startPull$ = this.actions$
    .ofType(Web3Actions.Types.START_PULL)
    .mergeMap(action => of(new Web3Actions.ProccessPull()));

  @Effect({dispatch: false}) pull$ = this.actions$
    .ofType(Web3Actions.Types.PROCCESS_PULL)
    .delay(3000)
    .do(action => {
      let activeLoop: boolean;
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeLoop = web3.loop;
      });
      if (!activeLoop) return;
      this.store.dispatch(new Web3Actions.ProccessPull());
    });

  @Effect({dispatch: false}) transactionLookup$ = this.actions$
    .ofType(Web3Actions.Types.TRANSACTION_LOOKUP)
    .do(() => {
      let transactions: any;
      this.store.select('web3State').take(1).subscribe(web3 => {
        transactions = web3.transactions;
      });
      transactions.forEach((transaction) => {
        this.web3Service.web3.eth.getTransactionReceipt(transaction.hash, (error, data) => {
          if (!error && !data) return;
          transaction.callback(error, data);
          this.store.dispatch(new Web3Actions.TransactionUnsubscribe(transaction));
        })
      })
    });

  @Effect({dispatch: false}) web3Check$ = this.actions$
    .ofType(Web3Actions.Types.WEB3_CHECK)
    .do((action: Web3Actions.Web3Check) => {
      this.checkWeb3Service((error) => {
        if (error) return this.store.dispatch(new Web3Actions.Web3Error(error));
        return this.store.dispatch(new Web3Actions.Web3Success())
      })
    });

  @Effect() web3Error$ = this.actions$
    .ofType(Web3Actions.Types.WEB3_ERROR)
    .mergeMap((action: Web3Actions.Web3Error) => {
      let actions: any = [];
      let web3: Web3State;
      this.store.select('web3State').take(1).subscribe(web3State => {
        web3 = web3State;
      });
      if (web3.loop) {
        actions.push(new Web3Actions.StopPull());
      }
      if (!web3.bootstraped) {
        actions.push(new Web3Actions.BootstrapRetry());
      }
      return Observable.from(actions);
    });

  checkWeb3Service (callback: any) {
    this.web3Service.init().then(error => {
      if (error) return callback(error);
      this.contractsService.init().then(error => {
        if (error) return callback(error);
        return callback();
      })
    })
  };

}
