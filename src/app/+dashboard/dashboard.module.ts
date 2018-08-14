import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { PipesModule } from '../shared/pipes/pipes.module';

import { DashboardComponent } from './dashboard.component';

import { VillageExtrasComponent } from './village-extras/village-extras.component';
import { VillageInfoComponent } from './village-info/village-info.component';
import { VillageLogsComponent } from './village-logs/village-logs.component';
import { VillageQueuesComponent } from './village-queues/village-queues.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    PipesModule
  ],
  declarations: [
    DashboardComponent,
    VillageExtrasComponent,
    VillageInfoComponent,
    VillageLogsComponent,
    VillageQueuesComponent
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule {
}
