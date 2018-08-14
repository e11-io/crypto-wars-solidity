import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/combineLatest';

import { Web3State } from './web3.state';
import { Web3Actions } from './web3.actions';
import { Web3Service } from './web3.service';

import { ContractsService } from '../shared/contracts.service';
import { Status } from '../shared/status.model';

import { AssetsBuildingsDataActions } from '../assets/buildings/data/buildings-data.actions';
import { AssetsBuildingsQueueActions } from '../assets/buildings/queue/buildings-queue.actions';
import { AssetsUnitsDataActions } from '../assets/units/data/units-data.actions';
import { AssetsUnitsQueueActions } from '../assets/units/queue/units-queue.actions';
import { PlayerBattleActions } from '../player/battle/player-battle.actions';
import { PlayerBuildingsActions } from '../player/assets/buildings/player-buildings.actions';
import { PlayerResourcesActions } from '../player/resources/player-resources.actions';
import { PlayerTokensActions } from '../player/tokens/player-tokens.actions';
import { PlayerUnitsActions } from '../player/assets/units/player-units.actions';
import { PlayerVillageActions } from '../player/village/player-village.actions';

@Injectable()
export class Web3Effects {

  constructor(private actions$: Actions,
              private contractsService: ContractsService,
              private store: Store<any>,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch: false}) bootstrap$ = this.actions$
    .ofType(Web3Actions.Types.BOOTSTRAP)
    .do((action: Web3Actions.Bootstrap): any => {
      this.checkWeb3Service((error) => {
        if (error) {
          this.store.dispatch(new Web3Actions.Web3Error({
            status: new Status({ error })
          }));
          return
        }
        return this.store.dispatch(new Web3Actions.BootstrapSuccess());
      })
    });

  @Effect() bootstrapSuccess$ = this.actions$
    .ofType(Web3Actions.Types.BOOTSTRAP_SUCCESS)
    .mergeMap(action => {
      return Observable.from([
        new Web3Actions.StartPull(),
        new AssetsBuildingsDataActions.GetBuildingsData(),
        new AssetsUnitsDataActions.GetUnitsData(),
        new PlayerBattleActions.GetRewardsModifiers(),
        new PlayerBattleActions.GetAttackCooldown(),
      ]);
    });

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
        this.store.select(s => s.web3.lastBlock).take(1)
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
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      let hasVillage: boolean = false;
      this.store.select(s => s.player.village.villageName).take(1).subscribe(villageName => {
        hasVillage = !!villageName;
      })
      if (hasVillage) {
        this.store.dispatch(new PlayerBuildingsActions.GetPlayerBuildingsLength());
        this.store.dispatch(new PlayerResourcesActions.GetPlayerResources());
        this.store.dispatch(new AssetsBuildingsQueueActions.GetBuildingsQueue(activeAccount));
        this.store.dispatch(new AssetsUnitsQueueActions.GetUnitsQueue(activeAccount));
        this.store.dispatch(new PlayerUnitsActions.GetPlayerUnits());
        this.store.dispatch(new PlayerBattleActions.GetLastAttackBlock(activeAccount));
        this.store.dispatch(new PlayerVillageActions.GetUserPoints(activeAccount));
      }
      this.store.dispatch(new PlayerTokensActions.GetEthBalance(activeAccount));
      this.store.dispatch(new PlayerTokensActions.GetE11Balance(activeAccount));
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
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      if (activeAccount === action.payload[0]) {
        return;
      }
      if (!activeAccount) {
        this.store.dispatch(new Web3Actions.SetActiveAccount(action.payload[0]));
        this.store.dispatch(new PlayerVillageActions.GetVillageName(action.payload[0]));
        this.store.dispatch(new PlayerBattleActions.GetLastAttackBlock(action.payload[0]));
        this.store.dispatch(new PlayerVillageActions.GetUserPoints(action.payload[0]));
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
    .delay(10000)
    .do(action => {
      let activeLoop: boolean;
      this.store.select('web3').take(1).subscribe(web3 => {
        activeLoop = web3.loop;
      });
      if (!activeLoop) return;
      this.store.dispatch(new Web3Actions.ProccessPull());
    });

  @Effect({dispatch: false}) transactionLookup$ = this.actions$
    .ofType(Web3Actions.Types.TRANSACTION_LOOKUP)
    .do(() => {
      let transactions: any;
      this.store.select('web3').take(1).subscribe(web3 => {
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
        if (error) return this.store.dispatch(new Web3Actions.Web3Error({
          status: new Status({ error })
        }));
        return this.store.dispatch(new Web3Actions.Web3Success())
      })
    });

  @Effect() web3Error$ = this.actions$
    .ofType(Web3Actions.Types.WEB3_ERROR)
    .mergeMap((action: Web3Actions.Web3Error) => {
      let actions: any = [];
      let web3: Web3State;
      this.store.select('web3').take(1).subscribe(web3State => {
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
