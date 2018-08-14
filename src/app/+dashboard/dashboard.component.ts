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
import { BattleDetail } from '../../core/player/battle/battle-detail.model';
import { PlayerBattleActions } from '../../core/player/battle/player-battle.actions';
import { PlayerResourcesState, initialPlayerResourcesState } from '../../core/player/resources/player-resources.state';
import { Web3Service } from '../../core/web3/web3.service';

import { AbstractContainerComponent } from '../shared/components/abstract-container.component';
import { getCurrentBlockFromStore, getPercentBetweenBlocks, getRemainingBlocksBetween } from '../shared/util/helpers';
import { Building } from '../shared/models/building.model';
import { UnitMap } from '../shared/models/unit.model';

import * as selectors from '../app.selectors';


@Component({
  selector: 'e11-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends AbstractContainerComponent implements OnInit {

  buildingsInQueue: Building[];
  battleDetails: BattleDetail[] = [];
  e11Balance: number = 0;
  ownedBuildings: Building[];
  playerResources: any;
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
      this.setVillageName(),
      this.setBattleLogs(),
    );

  }

  ngOnInit() {
    this.store.dispatch(new PlayerBattleActions.GetBattleHistory());
  }

  setE11Balance() {
    return this.store.select(s => s.player.tokens.e11Balance).subscribe(e11Balance => {
      this.e11Balance = e11Balance;
    });
  }

  setPlayerResources() {
    return this.store.select(selectors.selectPlayerResources).subscribe(playerResources => {
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
            percent: 100
          });
        }
        return Object.assign({}, building, {
          finished: false,
          percent: getPercentBetweenBlocks(building.startBlock, building.endBlock, currentBlock)
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
            remainingBlocks: 0
          })
        }
        return Object.assign({}, unit, {
          finished: false,
          percent: getPercentBetweenBlocks(unit.startBlock, unit.endBlock, currentBlock),
          remainingBlocks: getRemainingBlocksBetween(currentBlock, unit.endBlock)
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

  viewBattleDetail(selectedBattle: BattleDetail) {
    this.store.dispatch(new PlayerBattleActions.SelectBattleDetail(selectedBattle.id));
    this.router.navigate(['/battle/history']);
  }

  navigateTo(page: string) {
    this.router.navigate(['/assets/' + page]);
  }

  setBattleLogs() {
    return this.store.select(s => s.player.battle.battles).distinctUntilChanged().subscribe(battles => {
      this.battleDetails = battles;
    });
  }

}
