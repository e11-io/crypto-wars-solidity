import { Component, OnInit, Input } from '@angular/core';
import { Router } from "@angular/router";
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/take';

import { CryptoWarsState } from '../app.state';

import { ContractsService } from '../../core/shared/contracts.service';
import { PlayerResourcesState, initialPlayerResourcesState } from '../../core/player/resources/player-resources.state';
import { Web3Service } from '../../core/web3/web3.service';

import { AbstractContainerComponent } from '../shared/components/abstract-container.component';
import { getCurrentBlockFromStore, getPercentBetweenBlocks, getRemainingSeconds } from '../shared/util/helpers';
import { Building } from '../shared/models/building.model';
import { UnitMap } from '../shared/models/unit.model';

@Component({
  selector: 'e11-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends AbstractContainerComponent {

  buildingsInQueue: Building[];
  e11Balance: number = 0;
  ownedBuildings: Building[];
  playerResources: PlayerResourcesState = initialPlayerResourcesState;
  unitsMap: UnitMap = {};
  unitsInQueue: any;
  villageName: string = '';

  constructor(public store: Store<CryptoWarsState>,
              private contractsService: ContractsService,
              private router: Router,
              private web3Service: Web3Service) {
    super(store);

    this.addToSubscriptions(
      this.setE11Balance(),
      this.setPlayerResources(),
      this.setBuildings(),
      this.setUnits(),
      this.setUnitsInQueue(),
      this.setVillageName()
    );

  }

  setE11Balance() {
    return this.store.select(s => s.player.tokens.e11Balance).subscribe(e11Balance => {
      this.e11Balance = e11Balance;
    });
  }

  setPlayerResources() {
    return this.store.select(s => s.player.resources).subscribe(playerResources => {
      this.playerResources = playerResources;
    });
  }

  setBuildings() {
    return this.store.select(s => s.app.buildingsList).distinctUntilChanged().subscribe(buildingsList => {
      this.ownedBuildings = buildingsList.filter(building => building.owned);
      this.buildingsInQueue = buildingsList.filter(building => building.inQueue).map(building => {
        let currentBlock = getCurrentBlockFromStore(this.store);
        if (building.endBlock <= currentBlock) {
          return Object.assign({}, building, {
            finished: true,
            percent: 100,
            remainingSeconds: 0,
          });
        }
        return Object.assign({}, building, {
          finished: false,
          percent: getPercentBetweenBlocks(building.startBlock, building.endBlock, currentBlock),
          remainingSeconds: getRemainingSeconds(building.endBlock, this.store),
        });
      });

    this.buildingsInQueue = this.buildingsInQueue.sort((a, b) => a.endBlock - b.endBlock);
    })
  }

  setUnits() {
    return this.store.select(s => s.app.unitsMap).subscribe(unitsMap => {
      this.unitsMap = unitsMap;
    });
  }

  setUnitsInQueue() {
    return this.store.select(s => s.app.unitsList).distinctUntilChanged().subscribe(unitsList => {
      this.unitsInQueue = unitsList.filter(unit => unit.inQueue).map(unit => {
        let currentBlock = getCurrentBlockFromStore(this.store);
        if (unit.endBlock <= currentBlock) {
          return Object.assign({}, unit, {
            finished: true,
            percent: 100,
            remainingSeconds: 0,
          })
        }
        return Object.assign({}, unit, {
          finished: false,
          percent: getPercentBetweenBlocks(unit.startBlock, unit.endBlock, currentBlock),
          remainingSeconds: getRemainingSeconds(unit.endBlock, this.store),
        })
      });

    this.unitsInQueue = this.unitsInQueue.sort((a, b) => a.endBlock - b.endBlock);
    })
  }

  setVillageName() {
    return this.store.select(s => s.player.village.villageName).subscribe(villageName => {
      this.villageName = villageName;
    });
  }


  navigateTo(page: string) {
    this.router.navigate(['/assets/' + page]);
  }

}
