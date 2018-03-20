import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";

import { Store } from '@ngrx/store';

import { AbstractContainerComponent } from '../shared/components/abstract-container.component';
import { CryptoWarsState } from '../app.reducer';

import { Web3Service } from '../shared/services/web3.service';
import { ContractsService } from '../shared/services/contracts.service';

import { Web3Actions } from '../../core/web3/web3.actions';
import { BuildingsQueueActions } from '../../core/buildings-queue/buildings-queue.actions';
import { UserVillageActions } from '../../core/user-village/user-village.actions';

import BigNumber from 'bignumber.js';

const ether = Math.pow(10, 18);

@Component({
  selector: 'e11-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})

export class OnboardingComponent extends AbstractContainerComponent {
	missing: string;
  step: string;

  constructor(public store: Store<CryptoWarsState>,
              private route: ActivatedRoute,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
    super(store);

    this.step = 'userCreation';

    this.addToSubscriptions(
      this.route.params.subscribe(params => {
        this.missing = params.missing;
      }),
      this.setVillageLoading(),
      this.setUser(),
    );

  }

  createUser(user) {
    if (!user.name || !user.village) {
      return;
    }

    this.store.dispatch(new UserVillageActions.CreateVillage(user));
  }

  setUser() {
    return this.store.select('userState').subscribe(userState => {
      if (this.missing === 'eth-balance' || this.missing === 'e11-balance') {
        if (userState.e11Balance && userState.ethBalance) {
          window.location.reload();
        }
      }
    })
  }

  setVillageLoading() {
    return this.store.select('userVillageState').subscribe(userVillage => {
      if (userVillage.error && userVillage.error != 'user_has_no_village') {
        this.step = 'failedCreation';
        return;
      }
      if (userVillage.loading) {
        this.step = 'creatingVillage';
        return;
      }
    })
  }

}
