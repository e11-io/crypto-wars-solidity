import { ModuleWithProviders, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { initialPlayerState, playerReducerProvider, playerReducerToken } from './player.state';

import { PlayerBuildingsEffects } from './assets/buildings/player-buildings.effects';
import { PlayerResourcesEffects } from './resources/player-resources.effects';
import { PlayerTokensEffects } from './tokens/player-tokens.effects';
import { PlayerUnitsEffects } from './assets/units/player-units.effects';
import { PlayerVillageEffects } from './village/player-village.effects';

import { PlayerBuildingsService } from './assets/buildings/player-buildings.service';
import { PlayerUnitsService } from './assets/units/player-units.service';


@NgModule({
  imports: [
    StoreModule.forFeature('player', playerReducerToken, {
        initialState: initialPlayerState
    }),
    EffectsModule.forFeature([
      PlayerBuildingsEffects,
      PlayerResourcesEffects,
      PlayerTokensEffects,
      PlayerUnitsEffects,
      PlayerVillageEffects,
    ])
  ],
  providers: [
    PlayerBuildingsService,
    PlayerUnitsService,
    playerReducerProvider,
  ]
})
export class PlayerCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: PlayerCoreModule,
      providers: [
        PlayerBuildingsService,
        PlayerUnitsService,
        playerReducerProvider,
      ]
    };
  }
}
