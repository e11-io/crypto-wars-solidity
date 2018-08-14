import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { BattleComponent } from "./battle.component";

import { BattleArmySelectionComponent } from './army-selection/army-selection.component';
import { BattleArmyStatsComponent } from './army-stats/army-stats.component';
import { BattleHistoryComponent } from './+history/history.component';
import { BattleTargetComponent } from './+target/target.component';
import { TargetsListComponent } from './targets-list/targets-list.component';

import { PipesModule } from '../shared/pipes/pipes.module';

@NgModule({
    imports: [
      CommonModule,
      FormsModule,
      RouterModule,
      TranslateModule,
      PipesModule
    ],
    declarations: [
        BattleComponent,
        BattleArmySelectionComponent,
        BattleArmyStatsComponent,
        BattleHistoryComponent,
        BattleTargetComponent,
        TargetsListComponent,
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BattleModule {
}
