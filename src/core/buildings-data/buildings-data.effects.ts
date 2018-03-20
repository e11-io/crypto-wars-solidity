import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { Web3Service } from '../../app/shared/services/web3.service';
import { BuildingsDataService } from '../../app/shared/services/buildings-data.service';

import { BuildingsDataActions } from './buildings-data.actions';
import { BuildingsQueueActions } from '../buildings-queue/buildings-queue.actions';
import { BuildingsActions } from '../buildings/buildings.actions';
import { Web3Actions } from '../web3/web3.actions';


@Injectable()
export class BuildingsDataEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService,
              private buildingsDataService: BuildingsDataService) {
  }

  @Effect({dispatch: false}) getBuildingsLength$ = this.actions$
    .ofType(BuildingsDataActions.Types.GET_BUILDINGS_LENGTH)
    .switchMap((action): any =>
      this.buildingsDataService.getBuildingIdsLength()
        .map((buildindsIdsLength: any) => {
          if (buildindsIdsLength.error) {
            return this.store.dispatch(new BuildingsDataActions.GetBuildingsLengthFailure(buildindsIdsLength.error));
          }
          return this.store.dispatch(new BuildingsDataActions.GetBuildingsIds(buildindsIdsLength.toNumber()));
        })
    )

  @Effect({dispatch: false}) getBuildingsIds$ = this.actions$
    .ofType(BuildingsDataActions.Types.GET_BUILDINGS_IDS)
    .switchMap((action: BuildingsDataActions.GetBuildingsIds) =>
      this.buildingsDataService.getBuildingsIds(action.payload)
        .map((ids: any) => {
          ids = ids.map(id => id.toNumber());
          return this.store.dispatch(new BuildingsDataActions.GetBuildingsData(ids));
        })
    )

  @Effect({dispatch: false}) getBuildingsData$ = this.actions$
    .ofType(BuildingsDataActions.Types.GET_BUILDINGS_DATA)
    .switchMap((action: BuildingsDataActions.GetBuildingsData) => {
      return this.buildingsDataService.getBuildingsData(action.payload)
        .map((buildings) => {
          let object = {
            ids: action.payload,
            buildings
          }
          return this.store.dispatch(
            new BuildingsDataActions.GetBuildingsDataSuccess(object)
          )
        });
    })

}
