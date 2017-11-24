import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Web3Service } from './web3.service';
import { ContractsService } from './contracts.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    ContractsService,
    Web3Service
  ],
  declarations: []
})
export class ServicesModule {
}
