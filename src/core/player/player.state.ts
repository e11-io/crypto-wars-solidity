import { InjectionToken } from '@angular/core';
import { ActionReducerMap, combineReducers } from '@ngrx/store';

import { playerBuildingsReducer } from './assets/buildings/player-buildings.reducer';
import { PlayerBuildingsState, initialPlayerBuildingsState } from './assets/buildings/player-buildings.state';
import { playerResourcesReducer } from './resources/player-resources.reducer';
import { PlayerResourcesState, initialPlayerResourcesState } from './resources/player-resources.state';
import { playerTokensReducer } from './tokens/player-tokens.reducer';
import { PlayerTokensState, initialPlayerTokensState } from './tokens/player-tokens.state';
import { playerUnitsReducer } from './assets/units/player-units.reducer';
import { PlayerUnitsState, initialPlayerUnitsState } from './assets/units/player-units.state';
import { playerVillageReducer } from './village/player-village.reducer';
import { PlayerVillageState, initialPlayerVillageState } from './village/player-village.state';

export interface PlayerState {
  assets: {
    buildings: PlayerBuildingsState;
    units:     PlayerUnitsState;
  };
  resources: PlayerResourcesState;
  tokens:    PlayerTokensState,
  village:   PlayerVillageState;
}

export const initialPlayerState: PlayerState = {
  assets:    {
    buildings: initialPlayerBuildingsState,
    units:     initialPlayerUnitsState,
  },
  resources: initialPlayerResourcesState,
  tokens:    initialPlayerTokensState,
  village:   initialPlayerVillageState,
};


export const playerReducers = combineReducers({
  assets: combineReducers({
    buildings: playerBuildingsReducer,
    units:     playerUnitsReducer
  }),
  resources: playerResourcesReducer,
  tokens:    playerTokensReducer,
  village:   playerVillageReducer
});

export const playerReducerToken = new InjectionToken<ActionReducerMap<PlayerState>>('player');

export function getReducers() {
    return playerReducers;
}

export const playerReducerProvider = [
    { provide: playerReducerToken, useFactory: getReducers }
];
