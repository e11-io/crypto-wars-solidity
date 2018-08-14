import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { Web3Service } from '../../web3/web3.service';

import { VillageInfo } from '../village/village-info.model';
import { PlayerVillageService } from '../village/player-village.service';
import { PlayerTargetsActions } from './player-targets.actions';
import { PlayerTargetsService } from './player-targets.service';
import { PlayerTargetsState } from './player-targets.state';
import { PlayerTarget } from './player-target.model';


declare let window: any;

@Injectable()
export class PlayerTargetsEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private playerTargetsService: PlayerTargetsService,
              private playerVillageService: PlayerVillageService,
              private web3Service: Web3Service) {
  }

  @Effect() clearTargets =  this.actions$
    .ofType(PlayerTargetsActions.Types.CLEAR_TARGETS)
    .mergeMap((action: PlayerTargetsActions.ClearTargets) =>
      Observable.from([
        new PlayerTargetsActions.SetCurrentBlock(null),
        new PlayerTargetsActions.SetOldestBlock(null),
        new PlayerTargetsActions.SetTargets([]),
      ])
    );

  @Effect({dispatch:false}) getTargets$ =  this.actions$
    .ofType(PlayerTargetsActions.Types.GET_TARGETS)
    .do((action: PlayerTargetsActions.GetTargets) => {
      let targetsState: PlayerTargetsState;
      this.store.select(s => s.player.targets).take(1).subscribe(state => {
        targetsState = state;
      })
      let activeAccount: string;
      this.store.select(s => s.web3.activeAccount).take(1).subscribe(account => {
        activeAccount = account;
      })

      if (!targetsState.currentBlock && targetsState.currentBlock !== 0) {
        return this.web3Service.getBlockNumber().then(currentBlock => {
          this.store.dispatch(new PlayerTargetsActions.SetCurrentBlock(currentBlock));
          this.store.dispatch(new PlayerTargetsActions.SetOldestBlock(currentBlock));
          this.store.dispatch(new PlayerTargetsActions.GetTargets());
        });
      }

      return this.playerTargetsService.getEvents({
        targets: targetsState.targets,
        currentBlock: targetsState.currentBlock,
        searchThreshold: targetsState.searchThreshold,
      }).then((data: any) => {
        if (data.error) {
          return this.store.dispatch(new PlayerTargetsActions.GetTargetsFailure(data.error));
        }
        // Populate targets
        // TODO Pre-check points to avoid querying invalid targets
        let indexes = [];
        let newTargets = data.targets.filter((target, i) => {
          if (target.username && target.username.length > 0) {
            return false;
          }
          indexes.push(i);
          return true;
        });
        let newTargetAddresses = newTargets.map(t => t.address);


        this.playerVillageService.getUserInfo(activeAccount, newTargetAddresses).subscribe((villages: VillageInfo[]) => {

          newTargets = newTargets.map((newTarget, i) => new PlayerTarget(Object.assign(newTarget, villages[i])));
          let validTargets = newTargets.filter(target => target.canAttack);
          indexes.forEach((pointer, i) => {
            data.targets[pointer] = newTargets[i];
          });

          if (newTargetAddresses.length > 0) {
            this.store.dispatch(new PlayerTargetsActions.SetTargets(data.targets))
          }

          let currentBlock = data.currentBlock - targetsState.searchThreshold;
          if (currentBlock < 0) {
            this.store.dispatch(new PlayerTargetsActions.SetCurrentBlock(null));
            this.store.dispatch(new PlayerTargetsActions.SetOldestBlock(null));
            this.store.dispatch(new PlayerTargetsActions.GetTargetsSuccess());
            return;
          }

          if (validTargets.length >= 10 || data.currentBlock < targetsState.oldestBlock - targetsState.limitThreshold) {
            this.store.dispatch(new PlayerTargetsActions.SetCurrentBlock(currentBlock));
            this.store.dispatch(new PlayerTargetsActions.SetOldestBlock(currentBlock));
            this.store.dispatch(new PlayerTargetsActions.GetTargetsSuccess());
          } else {
            // Continue searching for targets
            this.store.dispatch(new PlayerTargetsActions.SetCurrentBlock(currentBlock));
            this.store.dispatch(new PlayerTargetsActions.GetTargets());
          }
        });

      })
    })

  @Effect({dispatch:false}) getTarget$ =  this.actions$
    .ofType(PlayerTargetsActions.Types.GET_TARGET)
    .do((action: PlayerTargetsActions.GetTarget) => {
      let targetsState: PlayerTargetsState;
      this.store.select(s => s.player.targets).take(1).subscribe(state => {
        targetsState = state;
      })
      let activeAccount: string;
      this.store.select(s => s.web3.activeAccount).take(1).subscribe(account => {
        activeAccount = account;
      })

      let block: number;
      this.web3Service.getBlockNumber().then(currentBlock => {
        block = currentBlock;
      });

      this.playerVillageService.getUserPoints(action.payload).subscribe((result: any) => {
        if (!result || result.error) {
          return;
        }
        let points = result.points;
        this.playerVillageService.getUserInfo(activeAccount, [action.payload]).subscribe((villages: VillageInfo[]) => {
          if (!villages || villages.length == 0) return;
          let newTarget = new PlayerTarget({block, points, ...villages[0]});
          let found = false;
          let targets = targetsState.targets.map(target => {
            if (target.address == newTarget.address) {
              found = true;
              return newTarget;
            }
            return target;
          });
          if (!found) targets.unshift(newTarget);
          this.store.dispatch(new PlayerTargetsActions.SetTargets(targets))
        });
      });

    })

}
