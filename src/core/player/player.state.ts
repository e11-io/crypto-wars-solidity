import { InjectionToken } from '@angular/core';
import { ActionReducerMap, combineReducers } from '@ngrx/store';

import { playerArmyReducer } from './army/player-army.reducer';
import { PlayerArmyState, initialPlayerArmyState } from './army/player-army.state';

import { playerBuildingsReducer } from './assets/buildings/player-buildings.reducer';
import { PlayerBuildingsState, initialPlayerBuildingsState } from './assets/buildings/player-buildings.state';

import { playerResourcesReducer } from './resources/player-resources.reducer';
import { PlayerResourcesState, initialPlayerResourcesState } from './resources/player-resources.state';

import { playerBattleReducer } from './battle/player-battle.reducer';
import { PlayerBattleState, initialPlayerBattleState } from './battle/player-battle.state';

import { playerTargetsReducer } from './targets/player-targets.reducer';
import { PlayerTargetsState, initialPlayerTargetsState } from './targets/player-targets.state';

import { playerTokensReducer } from './tokens/player-tokens.reducer';
import { PlayerTokensState, initialPlayerTokensState } from './tokens/player-tokens.state';

import { playerUnitsReducer } from './assets/units/player-units.reducer';
import { PlayerUnitsState, initialPlayerUnitsState } from './assets/units/player-units.state';

import { playerVillageReducer } from './village/player-village.reducer';
import { PlayerVillageState, initialPlayerVillageState } from './village/player-village.state';

export interface PlayerState {
  army:      PlayerArmyState;
  assets: {
    buildings: PlayerBuildingsState;
    units:     PlayerUnitsState;
  };
  resources: PlayerResourcesState;
  battle:    PlayerBattleState;
  targets:   PlayerTargetsState;
  tokens:    PlayerTokensState;
  village:   PlayerVillageState;
}

export const initialPlayerState: PlayerState = {
  army: initialPlayerArmyState,
  assets:    {
    buildings: initialPlayerBuildingsState,
    units:     initialPlayerUnitsState,
  },
  resources: initialPlayerResourcesState,
  battle:    initialPlayerBattleState,
  targets:   initialPlayerTargetsState,
  tokens:    initialPlayerTokensState,
  village:   initialPlayerVillageState,
};


export const playerReducers = combineReducers({
  army: playerArmyReducer,
  assets: combineReducers({
    buildings: playerBuildingsReducer,
    units:     playerUnitsReducer
  }),
  resources: playerResourcesReducer,
  battle:    playerBattleReducer,
  targets:   playerTargetsReducer,
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
