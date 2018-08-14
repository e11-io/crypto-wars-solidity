import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/take';

import { CryptoWarsState } from '../../app.state';
import { ContractsService } from '../../../core/shared/contracts.service';
import { Web3Service } from '../../../core/web3/web3.service';

import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';
import { BuildingMap } from '../../shared/models/building.model';
import { Unit, UnitMap, UnitQuantitytMap } from '../../shared/models/unit.model';
// TODO We use UnitsMap here?
import { AssetsUnitsQueueActions } from '../../../core/assets/units/queue/units-queue.actions';

import * as selectors from '../../app.selectors';

@Component({
  selector: 'e11-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})

export class UnitsComponent extends AbstractContainerComponent {

  buildingsMap: BuildingMap = {};
  localUnits: any = [];
  remainingBlocks: number;
  playerResources: any;
  units: Unit[] = [];
  unitsInQueue: any = [];
  unitsToRecruit: UnitQuantitytMap = null;

  statsArray: any = [
    'health',
    'attack',
    'defense'
  ];

  constructor(public store: Store<CryptoWarsState>,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
    super(store);

    this.addToSubscriptions(
      this.setPlayerResources(),
      this.setBuildingsMap(),
      this.setUnitsMap(),
      this.setUnitsQueue(),
    );
  }

  addNewUnitsToQueue(unitId, quantity) {
    this.store.dispatch(new AssetsUnitsQueueActions.AddUnitToQueue({
      id: unitId,
      quantity,
    }));
  }

  itemActionRecruit(unit: any, quantity: number = 1) {
    if (unit.missingRequirements && unit.missingRequirements.length) {
      console.warn("Missing requirements to create this asset");
      return;
    }
    if (this.playerResources[unit.resource] < unit.price * quantity) {
      console.warn("Not enough " + unit.resource);
      return;
    }
    if (quantity <= 0) {
      console.warn("Quantity must be a positive integer, not: " + quantity);
      return;
    }
    this.addNewUnitsToQueue(unit.id, quantity);
  }

  setBuildingsMap() {
    return this.app$.map(app => app.buildingsList).subscribe(buildings => {
      buildings.forEach(building => {
        this.buildingsMap[building.id] = building;
      });
    });
  }

  setPlayerResources() {
    return this.store.select(selectors.selectPlayerResources).subscribe(playerResources => {
      this.playerResources = playerResources;
    })
  }

  setUnitsQueue() {
    return this.app$.map(app => app.unitsList).subscribe(unitsList => {
      this.unitsInQueue = unitsList.filter(units => units.inProgress);
      this.unitsInQueue = this.unitsInQueue.sort((a, b) => a.endBlock - b.endBlock);
      this.getRemainigQueueBlocks();
    })
  }

  setUnitsMap() {
    return this.app$.map(app => app.unitsMap).subscribe(unitsMap => {
      this.units = Object.values(unitsMap);
      if (!this.unitsToRecruit) {
        // NOTE We populate the unitsToRecruit var so our sliders work fine at init
        this.unitsToRecruit = {};
        this.units.forEach(unit => {
          this.unitsToRecruit[unit.id] = 1;
        });
      }
      this.updateMaxUnits();
    })
  }

  getRemainigQueueBlocks() {
    let blockNumber = this.getBlockNumber();
    this.remainingBlocks = 0;
    if (this.unitsInQueue.length) {
      let lastQueueUnit = this.unitsInQueue[this.unitsInQueue.length - 1];
      if (lastQueueUnit.inProgress) {
        this.remainingBlocks = lastQueueUnit.endBlock - blockNumber;
      }
    }
  }

  updateMaxUnits() {
    Object.keys(this.unitsToRecruit).forEach(key => {
      let unitMaped = this.units.find(u => u.id === parseInt(key));
      if (unitMaped) {
        let maxUnitsToRecruit = Math.floor(
          this.playerResources[unitMaped.resource] / unitMaped.price
        );
        if (maxUnitsToRecruit > 0 && this.unitsToRecruit[unitMaped.id] > maxUnitsToRecruit) {
          this.unitsToRecruit[unitMaped.id] = maxUnitsToRecruit;
        }
      }
    });
  }

  getBlockNumber() {
    let blockNumber;
    this.store.select('web3').take(1).subscribe(web3 => {
      blockNumber = web3.lastBlock;
    });
    return blockNumber;
  }

  trackByFn(index, item) {
    return item.id;
  }

}
