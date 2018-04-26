import { ModuleWithProviders, NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { web3Reducer } from './web3.reducer';
import { initialWeb3State } from './web3.state';
import { Web3Effects } from './web3.effects';
import { Web3Service } from './web3.service';


@NgModule({
  imports: [
    StoreModule.forFeature('web3', web3Reducer, {
        initialState: initialWeb3State
    }),
    EffectsModule.forFeature([
      Web3Effects,
    ])
  ],
  providers: [
    Web3Service
  ]
})
export class Web3CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: Web3CoreModule,
      providers: [
        Web3Service
      ]
    };
  }
}
