import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { Web3Service } from '../../app/shared/services/web3.service';
import { AssetsRequirementsService } from '../../app/shared/services/assets-requirements.service';


import { BuildingsDataActions } from '../buildings-data/buildings-data.actions';
import { AssetsRequirementsActions } from './assets-requirements.actions';


@Injectable()
export class AssetsRequirementsEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService,
              private assetsRequirementsService: AssetsRequirementsService) {
  }

  @Effect({dispatch: false}) getBuildingsData$ = this.actions$
    .ofType(BuildingsDataActions.Types.GET_BUILDINGS_DATA)
    .switchMap((action: BuildingsDataActions.GetBuildingsData) => {
      return this.assetsRequirementsService.getAssetsRequirements(action.payload)
        .map((requirements) => {
          let object = {
            ids: action.payload,
            requirements
          }
          return this.store.dispatch(
            new AssetsRequirementsActions.GetAssetsRequirementsSuccess(object)
          )
        });
    })





}
