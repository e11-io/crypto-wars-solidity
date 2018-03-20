import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { Web3Service } from '../../app/shared/services/web3.service';
import { BuildingsActions } from "./buildings.actions";
import { UserResourcesActions } from "../user-resources/user-resources.actions";

@Injectable()
export class BuildingsEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch: false}) setBuildings$ = this.actions$
    .ofType(BuildingsActions.Types.SET_BUILDINGS)
    .do(action => {
      this.store.select(s => s).take(1).subscribe(s => {
        let buildings = s.buildingsState.buildings;
        let blockNumber = s.web3State.lastBlock;
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

        this.store.dispatch(new UserResourcesActions.SetRatesAndCapacty(
          {goldRate, crystalRate, goldCapacity, crystalCapacity}
        ));
      })
    })
}
