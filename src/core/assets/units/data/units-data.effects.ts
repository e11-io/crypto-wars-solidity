import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';


import { AssetsUnitsDataActions } from './units-data.actions';
import { AssetsUnitsDataService } from './units-data.service';
import { DataUnit } from './data-unit.model';

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

  @Effect() getUnitsData$ = this.actions$
    .ofType(AssetsUnitsDataActions.Types.GET_UNITS_DATA)
    .switchMap((action: AssetsUnitsDataActions.GetUnitsData) => {
      return this.unitsDataService.getUnitsData()
        .map((unitsData) => {
          if (!unitsData[0] || unitsData[0].error ||
              !unitsData[1] || unitsData[1].error) {
            return new AssetsUnitsDataActions.GetUnitsDataFailure({
              error: unitsData[0].error || unitsData[1].error || 'unknown'
            });
          }
          unitsData = unitsData[0].concat(unitsData[1]);
          let names = unitsData.shift(); // Shift first value (name)
          let ids = unitsData.shift(); // Shift second value (id)
          let units = {};
          ids.forEach((id, i) => {
            id = id.toNumber();
            let name = this.web3Service.web3.utils.hexToUtf8(names[i]);
            units[id] = new DataUnit(id,
              [name, ...unitsData.map(data => data[i])]
            );
          })
          return new AssetsUnitsDataActions.GetUnitsDataSuccess(units);
        });
    })

}
