import { InjectionToken } from '@angular/core';
import { ActionReducerMap, combineReducers } from '@ngrx/store';

import { assetsRequirementsReducer  } from './requirements/assets-requirements.reducer';
import { AssetsRequirementsState, initialAssetsRequirementsState  } from './requirements/assets-requirements.state';
import { assetsBuildingsDataReducer } from './buildings/data/buildings-data.reducer';
import { AssetsBuildingsDataState, initialAssetsBuildingsDataState } from './buildings/data/buildings-data.state';
import { assetsBuildingsQueueReducer } from './buildings/queue/buildings-queue.reducer';
import { AssetsBuildingsQueueState, initialAssetsBuildingsQueueState } from './buildings/queue/buildings-queue.state';
import { assetsUnitsDataReducer  } from './units/data/units-data.reducer';
import { AssetsUnitsDataState, initialAssetsUnitsDataState  } from './units/data/units-data.state';
import { assetsUnitsQueueReducer  } from './units/queue/units-queue.reducer';
import { AssetsUnitsQueueState, initialAssetsUnitsQueueState  } from './units/queue/units-queue.state';


export interface AssetsBuildingsState {
  data:  AssetsBuildingsDataState;
  queue: AssetsBuildingsQueueState;
};

export interface AssetsUnitsState {
  data:  AssetsUnitsDataState;
  queue: AssetsUnitsQueueState;
};

export interface AssetsState {
  buildings:    AssetsBuildingsState;
  requirements: AssetsRequirementsState;
  units:        AssetsUnitsState;
};

export const initialAssetsState: AssetsState = {
  buildings: {
    data:  initialAssetsBuildingsDataState,
    queue: initialAssetsBuildingsQueueState,
  },
  requirements: initialAssetsRequirementsState,
  units: {
    data:  initialAssetsUnitsDataState,
    queue: initialAssetsUnitsQueueState,
  },
};


export const assetsReducers = combineReducers({
  buildings: combineReducers({
    data:  assetsBuildingsDataReducer,
    queue: assetsBuildingsQueueReducer,
  }),
  requirements: assetsRequirementsReducer,
  units: combineReducers({
    data:  assetsUnitsDataReducer,
    queue: assetsUnitsQueueReducer,
  }),
});


export const assetsReducerToken = new InjectionToken<ActionReducerMap<AssetsState>>('assets');

export function getReducers() {
    return assetsReducers;
};

export const assetsReducerProvider = [
    { provide: assetsReducerToken, useFactory: getReducers }
];
