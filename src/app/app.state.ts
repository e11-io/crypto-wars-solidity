import {
  ActionReducerMap,
  ActionReducer,
  combineReducers,
  compose,
  MetaReducer
} from '@ngrx/store';
// TODO Clean unused imports
import "rxjs/add/operator/let";
import "rxjs/add/operator/switchMap";

import { environment } from "../environments/environment";
import { storeFreeze } from "ngrx-store-freeze";

import { Building } from './shared/models/building.model';
import { Unit, UnitMap } from './shared/models/unit.model';

// States and Reducers
import { appReducer } from './app.reducer';

import { AssetsState } from '../core/assets/assets.state';
import { PlayerState } from '../core/player/player.state';
import { Web3State } from '../core/web3/web3.state';

export interface AppState {
  buildingsList: Building[];
  initialized:   boolean;
  unitsList:     Unit[];
  unitsMap:      UnitMap;
}

export const initialAppState = {
  buildingsList: [],
  initialized:   false,
  unitsList:     [],
  unitsMap:      {},
}

export interface CryptoWarsState {
    app:    AppState,
    assets: AssetsState,
    player: PlayerState,
    web3:   Web3State,
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<CryptoWarsState>[] = !environment.production
  ? [storeFreeze] : [];
