import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';


import { AssetsUnitsDataActions } from './units-data.actions';
import { AssetsUnitsDataService } from './units-data.service';

import { ContractsService } from '../../../shared/contracts.service';
import { Status } from '../../../shared/status.model';

import { Web3Service } from '../../../web3/web3.service';

@Injectable()
export class AssetsUnitsDataEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private contractsService: ContractsService,
              private unitsDataService: AssetsUnitsDataService,
              private web3Service: Web3Service) {
  }

  @Effect({dispatch: false}) getUnitsLength$ = this.actions$
    .ofType(AssetsUnitsDataActions.Types.GET_UNITS_LENGTH)
    .switchMap((action): any =>
      this.unitsDataService.getUnitIdsLength()
        .map((unitsIdsLength: any) => {
          if (unitsIdsLength.error) {
            return this.store.dispatch(new AssetsUnitsDataActions.GetUnitsLengthFailure({
              status: new Status({ error: unitsIdsLength.error })
            }));
          }
          return this.store.dispatch(new AssetsUnitsDataActions.GetUnitsIds(unitsIdsLength.toNumber()));
        })
    )

  @Effect({dispatch: false}) getUnitsIds$ = this.actions$
    .ofType(AssetsUnitsDataActions.Types.GET_UNITS_IDS)
    .switchMap((action: AssetsUnitsDataActions.GetUnitsIds) =>
      this.unitsDataService.getUnitsIds(action.payload)
        .map((ids: any) => {
          ids = ids.map(id => id.toNumber());
          return this.store.dispatch(new AssetsUnitsDataActions.GetUnitsData(ids));
        })
    )

  @Effect({dispatch: false}) getUnitsData$ = this.actions$
    .ofType(AssetsUnitsDataActions.Types.GET_UNITS_DATA)
    .switchMap((action: AssetsUnitsDataActions.GetUnitsData) => {
      return this.unitsDataService.getUnitsData(action.payload)
        .map((units) => {
          return this.store.dispatch(
            new AssetsUnitsDataActions.GetUnitsDataSuccess({
              ids: action.payload,
              units
            })
          )
        });
    })

}
