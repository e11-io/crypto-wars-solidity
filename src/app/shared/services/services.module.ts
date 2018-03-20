import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from './web3.service';
import { ContractsService } from './contracts.service';
import { BuildingsDataService } from './buildings-data.service';
import { UserBuildingsService } from './user-buildings.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ContractsService,
    Web3Service,
    BuildingsDataService,
    UserBuildingsService
  ],
  declarations: []
})
export class ServicesModule {
}
