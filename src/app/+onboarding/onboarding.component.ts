import { Component } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Store } from '@ngrx/store';

import BigNumber from 'bignumber.js';

import { ContractsService } from '../../core/shared/contracts.service';
import { PlayerVillageActions } from '../../core/player/village/player-village.actions';
import { Web3Actions } from '../../core/web3/web3.actions';
import { Web3Service } from '../../core/web3/web3.service';

import { CryptoWarsState } from '../app.state';

import { AbstractContainerComponent } from '../shared/components/abstract-container.component';

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
              private contractsService: ContractsService,
              private route: ActivatedRoute,
              private web3Service: Web3Service) {
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

    this.store.dispatch(new PlayerVillageActions.CreateVillage(user));
  }

  setUser() {
    return this.store.select(s => s.player.tokens).subscribe(tokens => {
      if (this.missing === 'eth-balance' || this.missing === 'e11-balance') {
        if (tokens.e11Balance && tokens.ethBalance) {
          window.location.reload();
        }
      }
    })
  }

  setVillageLoading() {
    return this.store.select(s => s.player.village).subscribe(playerVillage => {
      if (playerVillage.status.error && playerVillage.status.error != 'player_has_no_village') {
        this.step = 'failedCreation';
        return;
      }
      if (playerVillage.status.loading) {
        this.step = 'creatingVillage';
        return;
      }
    })
  }

}
