import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { AssetsComponent } from './assets.component';
import { BuildingsComponent } from './+buildings/buildings.component';
import { DefenseComponent } from './+defense/defense.component';
import { QueueNavbarComponent } from './queue-navbar/queue-navbar.component';
import { ResearchComponent } from './+research/research.component';
import { UnitsComponent } from './+units/units.component';

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
        AssetsComponent,
        BuildingsComponent,
        DefenseComponent,
        QueueNavbarComponent,
        ResearchComponent,
        UnitsComponent,
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AssetsModule {
}
