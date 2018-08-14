import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { Web3Service } from '../../web3/web3.service';
import { Status } from '../../shared/status.model';
import { ContractsService } from '../../shared/contracts.service';

import { PlayerBattleActions } from './player-battle.actions';
import { PlayerBattleService } from './player-battle.service';
import { PlayerBattleState } from './player-battle.state';
import { PlayerBattle } from './player-battle.model';


declare let window: any;

@Injectable()
export class PlayerBattleEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private playerBattleService: PlayerBattleService,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch: false}) attack = this.actions$
    .ofType(PlayerBattleActions.Types.ATTACK)
    .do((action: PlayerBattleActions.Attack): any => {
      let activeAccount: string = '';
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      this.web3Service.sendContractTransaction(
        this.contractsService.BattleSystemInstance.attack,
        [action.payload.address, action.payload.ids, action.payload.quantities, {from: activeAccount}],
        (error, data) => {
          if (error) {
            return this.store.dispatch(new PlayerBattleActions.AttackFailure({
              status: new Status(error)
            }));
          }
          return this.store.dispatch(new PlayerBattleActions.AttackSuccess());
        })
    });

  @Effect() clearBattleHistory$ =  this.actions$
    .ofType(PlayerBattleActions.Types.CLEAR_BATTLE_HISTORY)
    .mergeMap((action: PlayerBattleActions.ClearBattleHistory) =>
      Observable.from([
        new PlayerBattleActions.SetCurrentBlock(null),
        new PlayerBattleActions.SetOldestBlock(null),
        new PlayerBattleActions.SetBattleHistory([]),
      ])
    );


  @Effect({dispatch:false}) getBattleHistory$ =  this.actions$
    .ofType(PlayerBattleActions.Types.GET_BATTLE_HISTORY)
    .do((action: PlayerBattleActions.GetBattleHistory) => {
      let battleState: PlayerBattleState;
      this.store.select(s => s.player.battle).take(1).subscribe(state => {
        battleState = state;
      })
      let activeAccount: string;
      this.store.select(s => s.web3.activeAccount).take(1).subscribe(account => {
        activeAccount = account;
      })

      if (!battleState.currentBlock && battleState.currentBlock !== 0) {
        this.web3Service.getBlockNumber().then(currentBlock => {
          this.store.dispatch(new PlayerBattleActions.SetCurrentBlock(currentBlock));
          this.store.dispatch(new PlayerBattleActions.SetOldestBlock(currentBlock));
          this.store.dispatch(new PlayerBattleActions.SetBattleHistory([]));
          this.store.dispatch(new PlayerBattleActions.GetBattleHistory());
        });
      } else {
        this.playerBattleService.getBattleHistory({
          battles: battleState.battles,
          currentBlock: battleState.currentBlock,
          searchThreshold: battleState.searchThreshold,
          account: activeAccount
        }).then((data: any) => {
          if (data.error) {
            return this.store.dispatch(new PlayerBattleActions.GetBattleHistoryFailure(data.error));
          }

          if (data.battles && data.battles.length > 0) {
            this.store.dispatch(new PlayerBattleActions.SetBattleHistory(data.battles));
          }

          let currentBlock = data.currentBlock - battleState.searchThreshold;
          if (currentBlock < 0) {
            this.store.dispatch(new PlayerBattleActions.SetCurrentBlock(null));
            this.store.dispatch(new PlayerBattleActions.SetOldestBlock(null));
            this.store.dispatch(new PlayerBattleActions.GetBattleHistorySuccess());
            return;
          }

          if (data.battles.length >= 10 ||
              data.currentBlock < battleState.oldestBlock - battleState.limitThreshold) {
            this.store.dispatch(new PlayerBattleActions.SetCurrentBlock(currentBlock));
            this.store.dispatch(new PlayerBattleActions.SetOldestBlock(currentBlock));
            this.store.dispatch(new PlayerBattleActions.GetBattleHistorySuccess());
          } else {
            // Continue searching for targets
            this.store.dispatch(new PlayerBattleActions.SetCurrentBlock(currentBlock));
            this.store.dispatch(new PlayerBattleActions.GetBattleHistory());
          }
        });
      }
    })

  @Effect() getRewardsModifiers$ = this.actions$
    .ofType(PlayerBattleActions.Types.GET_REWARDS_MODIFIERS)
    .switchMap((action): any =>
      this.playerBattleService.getBattleRewardModifiers()
        .map((rewardsModifiers: any) => {
          if (rewardsModifiers.error) {
            return new PlayerBattleActions.GetRewardsModifiersFailure({
              status: new Status({ error: rewardsModifiers.error })
            });
          }
          return new PlayerBattleActions.GetRewardsModifiersSuccess(rewardsModifiers);
        })
    )

  @Effect() getAttackCooldown$ = this.actions$
    .ofType(PlayerBattleActions.Types.GET_ATTACK_COOLDOWN)
    .switchMap((action): any =>
      this.playerBattleService.getAttackCooldown()
        .map((attackCooldown: any) => {
          if (attackCooldown.error) {
            return new PlayerBattleActions.GetAttackCooldownFailure({
              status: new Status({ error: attackCooldown.error })
            });
          }
          return new PlayerBattleActions.GetAttackCooldownSuccess(attackCooldown);
        })
    )

  @Effect() getLastAttackBlock$ = this.actions$
    .ofType(PlayerBattleActions.Types.GET_LAST_ATTACK_BLOCK)
    .switchMap((action: PlayerBattleActions.GetLastAttackBlock): any =>
      this.playerBattleService.getLastAttackBlock(action.payload)
        .map((lastAttackBlock: any) => {
          if (lastAttackBlock.error) {
            return new PlayerBattleActions.GetLastAttackBlockFailure({
              status: new Status({ error: lastAttackBlock.error })
            });
          }
          return new PlayerBattleActions.GetLastAttackBlockSuccess(lastAttackBlock);
        })
    )

}
