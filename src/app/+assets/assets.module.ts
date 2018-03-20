import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

import { AssetsComponent } from './assets.component';
import { BuildingsComponent } from './+buildings/buildings.component';
import { UnitsComponent } from './+units/units.component';
import { DefenseComponent } from './+defense/defense.component';
import { ResearchComponent } from './+research/research.component';
import { QueueNavbarComponent } from './queue-navbar/queue-navbar.component';

@NgModule({
    imports: [
      CommonModule,
      RouterModule,
      TranslateModule
    ],
    declarations: [
        AssetsComponent,
        BuildingsComponent,
        UnitsComponent,
        DefenseComponent,
        ResearchComponent,
        QueueNavbarComponent
    ],
    exports: [
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AssetsModule {
}
