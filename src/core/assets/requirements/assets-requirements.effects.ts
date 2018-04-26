import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { AssetsRequirementsActions } from './assets-requirements.actions';
import { AssetsRequirementsService } from './assets-requirements.service';

import { AssetsBuildingsDataActions } from '../buildings/data/buildings-data.actions';
import { AssetsUnitsDataActions } from '../units/data/units-data.actions';

import { ContractsService } from '../../shared/contracts.service';
import { Web3Service } from '../../web3/web3.service';


@Injectable()
export class AssetsRequirementsEffects {

  constructor(public store: Store<any>,
              private actions$: Actions,
              private assetsRequirementsService: AssetsRequirementsService,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
  }

  @Effect() getBuildingsRequirements = this.actions$
    .ofType(AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA)
    .switchMap((action: AssetsBuildingsDataActions.GetBuildingsDataSuccess) => {
      return this.assetsRequirementsService.getAssetsRequirements(action.payload)
        .map((requirements) => {
          let object = {
            ids: action.payload,
            requirements
          }
          return new AssetsRequirementsActions.GetRequirementsSuccess(object);
        });
    })

  @Effect() getUnitRequirements = this.actions$
    .ofType(AssetsUnitsDataActions.Types.GET_UNITS_DATA)
    .switchMap((action: AssetsUnitsDataActions.GetUnitsDataSuccess) => {
      return this.assetsRequirementsService.getAssetsRequirements(action.payload)
        .map((requirements) => {
          let object = {
            ids: action.payload,
            requirements
          }
          return new AssetsRequirementsActions.GetRequirementsSuccess(object);
        });
    })





}
