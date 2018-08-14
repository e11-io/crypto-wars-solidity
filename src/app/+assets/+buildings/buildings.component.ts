import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';

import { AssetsBuildingsQueueActions } from '../../../core/assets/buildings/queue/buildings-queue.actions';
import { ContractsService } from '../../../core/shared/contracts.service';
import { Web3Service } from '../../../core/web3/web3.service';

import { CryptoWarsState } from '../../app.state';

import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';
import { Building } from '../../shared/models/building.model';

import * as selectors from '../../app.selectors';

@Component({
  selector: 'e11-buildings',
  templateUrl: './buildings.component.html',
  styleUrls: ['./buildings.component.scss']
})

export class BuildingsComponent extends AbstractContainerComponent {

  availablePlayerBuildings: Building[] = [];
  buildingsMap: any = {};
  buildingsInQueue: any = [];
  localBuildings: any = [];
  remainingBlocks: number;
  playerResources: any;

  statsArray: any = [
    'health',
    'attack',
    'defense',
    'goldCapacity',
    'crystalCapacity',
    'goldRate',
    'crystalRate'
  ]

  constructor(public store: Store<CryptoWarsState>,
              private contractsService: ContractsService,
              private web3Service: Web3Service) {
    super(store);

    this.addToSubscriptions(
      this.setPlayerResources(),
      this.setBuildingsQueue(),
      this.setLocalBuildings(),
      this.setAvailablePlayerBuildings(), // This has to be last to wait for data initialization
    );
  }

  itemActionBuild(building: Building) {
    if (building.missingRequirements.length) {
      console.error("Missing requirements to create this asset");
      return;
    }
    if (this.playerResources[building.resource] < building.price
        || building.maxLevel
        || building.inProgress) {
      return;
    }
    if (building.owned) {
      this.upgradeBuilding(building);
    } else {
      this.addNewBuildingToQueue(building);
    }
  }

  setPlayerResources() {
    return this.store.select(selectors.selectPlayerResources).subscribe(playerResources => {
      this.playerResources = playerResources;
    })
  }

  setBuildingsQueue() {
    return this.store.select(s => s.app.buildingsList).subscribe(buildingsList => {
      this.buildingsInQueue = buildingsList.filter(building => building.inProgress);
      this.buildingsInQueue = this.buildingsInQueue.sort((a, b) => a.endBlock - b.endBlock);
      this.getRemainigQueueBlocks();
    })
  }

  setLocalBuildings() {
    return this.store.select(s => s.assets.buildings.queue.localList).subscribe(localBuildings => {
      this.localBuildings = localBuildings;
    })
  }

  getRemainigQueueBlocks() {
    let blockNumber = this.getBlockNumber();
    this.remainingBlocks = 0;
    if (this.buildingsInQueue.length) {
      let lastQueueBuilding = this.buildingsInQueue[this.buildingsInQueue.length - 1];
      if (lastQueueBuilding.inProgress) {
        this.remainingBlocks = lastQueueBuilding.endBlock - blockNumber;
      }
    }
  }

  getBlockNumber() {
    let blockNumber;
    this.store.select('web3').take(1).subscribe(web3 => {
      blockNumber = web3.lastBlock;
    });
    return blockNumber;
  }

  setAvailablePlayerBuildings() {
    return this.store.select(s => s.app.buildingsList).subscribe(buildings => {
      buildings.forEach(building => {
        this.buildingsMap[building.id] = building;
      });
      this.availablePlayerBuildings = this.getAvailablePlayerBuildings(buildings);
    });
  }

  getAvailablePlayerBuildings(buildings: Building[]) : Building[] {
    // Ensures all required data is available
    // Maps and filters player's buildings depending on the player's queued buildings
    let playerBuildings = buildings.filter(b => b.owned);
    // Checks if there is a next available level and sets building as maxLevel
    playerBuildings = playerBuildings.map(building => {
      let nextBuilding = this.buildingsMap[building.id + 1000];
      if (nextBuilding) {
        return new Building(Object.assign({}, building, {nextLevelId: nextBuilding.id}));
      }
      return new Building(Object.assign({}, building, {maxLevel: true}));
    })

    // Get all buildings that the player does not already have
    let newBuildings = buildings.filter((building) => {
      // If the level is > 1
      // Or if the player has this building already active
      if (building.level > 1 || playerBuildings.find(playerBuildings => playerBuildings.typeId == building.typeId)) {
        return false;
      }
      return true;
    });

    let availableBuildings = newBuildings.concat(playerBuildings);
    // Set buildings in progress when waiting for transaction confirmation.
    availableBuildings = availableBuildings.map(building => {
      if (this.localBuildings.find(b => b == building.id)) {
        return new Building(Object.assign({}, building, {waiting: true}));
      }
      return building;
    });

    // Sort available buildings by typeId
    availableBuildings = availableBuildings.sort((a, b) => a.typeId - b.typeId);
    return availableBuildings;
  }

  trackByFn(index, item) {
    return item.id;
  }

  addNewBuildingToQueue(build: Building) {
    this.availablePlayerBuildings = this.availablePlayerBuildings.map(building => {
      if (building.id === build.id) {
        return new Building(Object.assign({}, building, {inProgress: true}));
      }
      return building;
    })
    this.store.dispatch(new AssetsBuildingsQueueActions.AddBuildingToQueue(build));
  }

  upgradeBuilding(building: Building) {
    this.store.dispatch(new AssetsBuildingsQueueActions.UpgradeBuilding(building));
  }

  cancelBuilding(building: Building) {
    this.store.dispatch(new AssetsBuildingsQueueActions.CancelBuilding(building.id));
  }
}
