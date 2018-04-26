import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { AssetsBuildingsDataActions } from './buildings-data.actions';
import { AssetsBuildingsDataService } from './buildings-data.service';

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

  @Effect({dispatch: false}) getBuildingsLength$ = this.actions$
    .ofType(AssetsBuildingsDataActions.Types.GET_BUILDINGS_LENGTH)
    .switchMap((action): any =>
      this.buildingsDataService.getBuildingIdsLength()
        .map((buildindsIdsLength: any) => {
          if (buildindsIdsLength.error) {
            return this.store.dispatch(new AssetsBuildingsDataActions.GetBuildingsLengthFailure({
              status: new Status({ error: buildindsIdsLength.error })
            }));
          }
          return this.store.dispatch(new AssetsBuildingsDataActions.GetBuildingsIds(buildindsIdsLength.toNumber()));
        })
    )

  @Effect({dispatch: false}) getBuildingsIds$ = this.actions$
    .ofType(AssetsBuildingsDataActions.Types.GET_BUILDINGS_IDS)
    .switchMap((action: AssetsBuildingsDataActions.GetBuildingsIds) =>
      this.buildingsDataService.getBuildingsIds(action.payload)
        .map((ids: any) => {
          ids = ids.map(id => id.toNumber());
          return this.store.dispatch(new AssetsBuildingsDataActions.GetBuildingsData(ids));
        })
    )

  @Effect({dispatch: false}) getBuildingsData$ = this.actions$
    .ofType(AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA)
    .switchMap((action: AssetsBuildingsDataActions.GetBuildingsData) => {
      return this.buildingsDataService.getBuildingsData(action.payload)
        .map((buildings) => {
          return this.store.dispatch(
            new AssetsBuildingsDataActions.GetBuildingsDataSuccess({
              ids: action.payload,
              buildings
            })
          )
        });
    })

}
