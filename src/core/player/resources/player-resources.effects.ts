import { Actions, Effect } from '@ngrx/effects';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { PlayerResourcesActions } from './player-resources.actions';

import { ContractsService } from '../../shared/contracts.service';
import { Status } from '../../shared/status.model';

import { Web3Actions } from '../../web3/web3.actions';
import { Web3Service } from '../../web3/web3.service';

@Injectable()
export class PlayerResourcesEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch: false}) getPlayerResources$ = this.actions$
    .ofType(PlayerResourcesActions.Types.GET_PLAYER_RESOURCES)
    .do((action: PlayerResourcesActions.GetPlayerResources) => {
      let activeAccount: string;
      this.store.select('web3').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      this.web3Service.callContract(
        this.contractsService.UserResourcesInstance.getUserResources,
        [activeAccount]
      ).then((resources: any) => {
        if (resources.error) {
          return this.store.dispatch(new PlayerResourcesActions.GetPlayerResourcesFailure({
            status: new Status({ error: resources.error })
          }));
        }
        this.web3Service.callContract(
          this.contractsService.UserResourcesInstance.calculateUserResources,
          [activeAccount]
        ).then((unclaimedResources: any) => {
          if (unclaimedResources.error) {
            return this.store.dispatch(new PlayerResourcesActions.GetPlayerResourcesFailure({
              status: new Status({ error: resources.error })
            }));
          }

          let goldCapacity: number = 0;
          let crystalCapacity: number = 0;
          this.store.select(s => s.player.resources).take(1).subscribe(playerResources => {
            goldCapacity = playerResources.goldCapacity;
            crystalCapacity = playerResources.crystalCapacity;
          });

          let gold = resources[0].toNumber() + unclaimedResources[0].toNumber();
          let crystal = resources[1].toNumber() + unclaimedResources[1].toNumber();
          let quantum = resources[2].toNumber();

          gold = gold > goldCapacity ? goldCapacity : gold;
          crystal = crystal > crystalCapacity ? crystalCapacity : crystal;

          return this.store.dispatch(new PlayerResourcesActions.GetPlayerResourcesSuccess(
            [gold, crystal, quantum]
          ));
        })
      });
    });

  @Effect({dispatch: false}) setRatesAndCapacity = this.actions$
    .ofType(PlayerResourcesActions.Types.SET_RATES_AND_CAPACITY)
    .do((action: PlayerResourcesActions.SetRatesAndCapacty) => {
      this.store.select(s => s.app.initialized).take(1).subscribe(initialized => {
        if (initialized) {
          return this.store.dispatch(new PlayerResourcesActions.GetPlayerResources());
        }
      });
    });

  @Effect({dispatch: false}) giveResourcesToPlayer$ = this.actions$
    .ofType(PlayerResourcesActions.Types.GIVE_RESOURCES_TO_PLAYER)
    .do((action: PlayerResourcesActions.GiveResourcesToPlayer) =>
      this.web3Service.sendContractTransaction(
        this.contractsService.UserResourcesInstance.giveResourcesToPlayer,
        [action.payload, 200, 0, 0, {from: action.payload}]
      )
    );


}
