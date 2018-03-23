// import "@ngrx/core/add/operator/select";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/let";
import {combineReducers} from "@ngrx/store";
import {compose} from '@ngrx/store';
import {storeFreeze} from "ngrx-store-freeze";
import {environment} from "../environments/environment";

//Reducers
import { web3, Web3State } from '../core/web3/web3.reducer';
import { userResources, UserResourcesState } from '../core/user-resources/user-resources.reducer';
import { user, UserState } from '../core/user/user.reducer';
import { buildingsQueue, BuildingsQueueState } from '../core/buildings-queue/buildings-queue.reducer';
import { buildingsData, BuildingsDataState } from '../core/buildings-data/buildings-data.reducer';
import { userVillage, UserVillageState } from '../core/user-village/user-village.reducer';
import { userBuildings, UserBuildingsState } from '../core/user-buildings/user-buildings.reducer';
import { buildings, BuildingsState } from '../core/buildings/buildings.reducer';
import { assetsRequirements , AssetsRequirementsState } from '../core/assets-requirements/assets-requirements.reducer';


import {
  ActionReducerMap,
  // createSelector,
  // createFeatureSelector,
  ActionReducer,
  MetaReducer
} from '@ngrx/store';

export interface CryptoWarsState {
  web3State: Web3State,
  userResourcesState: UserResourcesState,
  userState: UserState,
  buildingsQueueState: BuildingsQueueState,
  buildingsDataState: BuildingsDataState,
  userVillageState: UserVillageState,
  userBuildingsState: UserBuildingsState,
  buildingsState: BuildingsState
  assetsRequirementsState: AssetsRequirementsState
}

export const AppReducers: ActionReducerMap<CryptoWarsState> = {
  web3State: web3,
  userResourcesState: userResources,
  userState: user,
  buildingsQueueState: buildingsQueue,
  buildingsDataState: buildingsData,
  userVillageState: userVillage,
  userBuildingsState: userBuildings,
  buildingsState: buildings,
  assetsRequirementsState: assetsRequirements
};

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
  export const metaReducers: MetaReducer<CryptoWarsState>[] = !environment.production
  ? [storeFreeze]
  : [];
