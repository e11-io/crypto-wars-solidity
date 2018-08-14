import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { AssetsBuildingsDataActions } from './buildings-data.actions';
import { AssetsBuildingsDataService } from './buildings-data.service';
import { DataBuilding } from './data-building.model';

import { ContractsService } from '../../../shared/contracts.service';
import { Status } from '../../../shared/status.model';

import { Web3Service } from '../../../web3/web3.service';

@Injectable()
export class AssetsBuildingsDataEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private buildingsDataService: AssetsBuildingsDataService,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect() getBuildingsData$ = this.actions$
    .ofType(AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA)
    .switchMap((action: AssetsBuildingsDataActions.GetBuildingsData) => {
      return this.buildingsDataService.getBuildingsData()
        .map((buildingsData) => {
          if (!buildingsData[0] || buildingsData[0].error ||
              !buildingsData[1] || buildingsData[1].error) {
            return new AssetsBuildingsDataActions.GetBuildingsDataFailure({
              error: buildingsData[0].error || buildingsData[1].error || 'unknown'
            });
          }
          buildingsData = buildingsData[0].concat(buildingsData[1]);
          let names = buildingsData.shift(); // Shift first value (name)
          let ids = buildingsData.shift(); // Shift second value (id)
          let buildings = {};
          ids.forEach((id, i) => {
            id = id.toNumber();
            let name = this.web3Service.web3.utils.hexToUtf8(names[i]);
            buildings[id] = new DataBuilding(id,
              [name, ...buildingsData.map(data => data[i])]
            );
          })

          return new AssetsBuildingsDataActions.GetBuildingsDataSuccess(buildings);
        });
    })

}
