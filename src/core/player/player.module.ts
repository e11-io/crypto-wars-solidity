import { ModuleWithProviders, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { initialPlayerState, playerReducerProvider, playerReducerToken } from './player.state';

import { PlayerBattleEffects } from './battle/player-battle.effects';
import { PlayerBuildingsEffects } from './assets/buildings/player-buildings.effects';
import { PlayerResourcesEffects } from './resources/player-resources.effects';
import { PlayerTargetsEffects } from './targets/player-targets.effects';
import { PlayerTokensEffects } from './tokens/player-tokens.effects';
import { PlayerUnitsEffects } from './assets/units/player-units.effects';
import { PlayerVillageEffects } from './village/player-village.effects';

import { BattleAlgorithmService } from './battle/battle-algorithm.service';
import { PlayerBattleService } from './battle/player-battle.service';
import { PlayerBuildingsService } from './assets/buildings/player-buildings.service';
import { PlayerTargetsService } from './targets/player-targets.service';
import { PlayerUnitsService } from './assets/units/player-units.service';
import { PlayerVillageService } from './village/player-village.service';


@NgModule({
  imports: [
    StoreModule.forFeature('player', playerReducerToken, {
        initialState: initialPlayerState
    }),
    EffectsModule.forFeature([
      PlayerBattleEffects,
      PlayerBuildingsEffects,
      PlayerResourcesEffects,
      PlayerTargetsEffects,
      PlayerTokensEffects,
      PlayerUnitsEffects,
      PlayerVillageEffects,
    ])
  ],
  providers: [
    BattleAlgorithmService,
    PlayerBattleService,
    PlayerBuildingsService,
    PlayerTargetsService,
    PlayerUnitsService,
    PlayerVillageService,
    playerReducerProvider,
  ]
})
export class PlayerCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlayerCoreModule,
      providers: [
        BattleAlgorithmService,
        PlayerBattleService,
        PlayerBuildingsService,
        PlayerTargetsService,
        PlayerUnitsService,
        PlayerVillageService,
        playerReducerProvider,
      ]
    };
  }
}
