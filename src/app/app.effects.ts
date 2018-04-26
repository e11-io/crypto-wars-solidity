import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { AppActions } from './app.actions';

import { Web3Actions } from '../core/web3/web3.actions';
import { PlayerResourcesActions } from '../core/player/resources/player-resources.actions';

@Injectable()
export class AppEffects {

  constructor(public store: Store<any>,
              private actions$: Actions) {
  }


  @Effect({dispatch: false}) setBuildings$ = this.actions$
    .ofType(AppActions.Types.SET_BUILDINGS)
    .do(action => {
      this.store.select(s => s).take(1).subscribe(store => {
        let buildings = store.app.buildingsList;
        let blockNumber = store.web3.lastBlock;
        let goldRate: number = 0;
        let crystalRate: number = 0;
        let goldCapacity: number = 0;
        let crystalCapacity: number = 0;

        buildings.forEach(b => {
          if (b.active || b.endBlock < blockNumber) {
            goldRate += b.goldRate;
            crystalRate += b.crystalRate;
            goldCapacity += b.goldCapacity;
            crystalCapacity += b.crystalCapacity;
            return b;
          }
          if (Math.floor(b.id / 1000) > 1 && b.endBlock >= blockNumber) {
            let previousBuilding = buildings.find(building => building.id == b.previousLevelId)
            goldCapacity += previousBuilding.goldCapacity;
            crystalCapacity += previousBuilding.crystalCapacity;
            return previousBuilding;
          }
          return;
        })
        this.store.dispatch(new PlayerResourcesActions.SetRatesAndCapacty(
          {goldRate, crystalRate, goldCapacity, crystalCapacity}
        ));
      })
  })

}
