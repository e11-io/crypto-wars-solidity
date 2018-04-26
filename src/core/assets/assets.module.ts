import { ModuleWithProviders, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { assetsReducerProvider, assetsReducerToken, initialAssetsState } from './assets.state';
import { AssetsBuildingsDataEffects } from './buildings/data/buildings-data.effects';
import { AssetsBuildingsDataService } from './buildings/data/buildings-data.service';
import { AssetsBuildingsQueueEffects } from './buildings/queue/buildings-queue.effects';
import { AssetsRequirementsEffects } from './requirements/assets-requirements.effects';
import { AssetsRequirementsService } from './requirements/assets-requirements.service';
import { AssetsUnitsDataEffects } from './units/data/units-data.effects';
import { AssetsUnitsDataService } from './units/data/units-data.service';
import { AssetsUnitsQueueEffects } from './units/queue/units-queue.effects';

@NgModule({
  imports: [
    StoreModule.forFeature('assets', assetsReducerToken, {
        initialState: initialAssetsState
    }),
    EffectsModule.forFeature([
      AssetsBuildingsDataEffects,
      AssetsBuildingsQueueEffects,
      AssetsRequirementsEffects,
      AssetsUnitsDataEffects,
      AssetsUnitsQueueEffects,
    ])
  ],
  providers: [
    AssetsBuildingsDataService,
    AssetsRequirementsService,
    AssetsUnitsDataService,
    assetsReducerProvider,
  ]
})
export class AssetsCoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: AssetsCoreModule,
      providers: [
        AssetsBuildingsDataService,
        AssetsRequirementsService,
        AssetsUnitsDataService,
        assetsReducerProvider,
      ]
    };
  }
}
