import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import 'rxjs/add/operator/take';

import { Building } from '../../../core/buildings/building.model';
import { BuildingsQueueActions } from '../../../core/buildings-queue/buildings-queue.actions';
import { UserActions } from '../../../core/user/user.actions';
import { UserResourcesActions } from '../../../core/user-resources/user-resources.actions';
import { UserVillageActions } from '../../../core/user-village/user-village.actions';
import { Web3Actions } from '../../../core/web3/web3.actions';

import { CryptoWarsState } from '../../app.reducer';
import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';
import { ContractsService } from '../../shared/services/contracts.service';
import { Web3Service } from '../../shared/services/web3.service';

@Component({
  selector: 'e11-buildings',
  templateUrl: './buildings.component.html',
  styleUrls: ['./buildings.component.scss']
})

export class BuildingsComponent extends AbstractContainerComponent {

  availableUserBuildings: Building[] = [];
  buildingsMap: any = {};
  buildingsInQueue: any = [];
  userResources: any;
  remainingBlocks: number;
  localBuildings: any = [];

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
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
    super(store);

    this.addToSubscriptions(
      this.setUserResources(),
      this.setBuildingsQueue(),
      this.setLocalBuildings(),
      this.setAvailableUserBuildings(), // This has to be last to wait for data initialization
    );
  }

  itemActionBuild(building: Building) {
    if (building.missingRequirements.length) {
      console.error("Missing requirements to create this asset");
      return;
    }
    if (this.userResources[building.resource] < building.price
        || building.maxLevel
        || building.inProgress) {
      return;
    }
    if (building.owned) {
      this.upgradeBuilding(building);
    } else {
      this.addNewBuildingToQueue(building.id);
    }
  }
  setUserResources() {
    return this.store.select('userResourcesState').subscribe(userResources => {
      this.userResources = userResources;
    })
  }

  setBuildingsQueue() {
    return this.store.select('buildingsState').subscribe(buildingsState => {
      this.buildingsInQueue = buildingsState.buildings.filter(building => building.inProgress);
      this.buildingsInQueue = this.buildingsInQueue.sort((a, b) => a.endBlock - b.endBlock);
      this.getRemainigQueueBlocks();
    })
  }

  setLocalBuildings() {
    return this.store.select('buildingsQueueState').map(s => s.localBuildings).subscribe(localBuildings => {
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
    this.store.select('web3State').take(1).subscribe(web3 => {
      blockNumber = web3.lastBlock;
    });
    return blockNumber;
  }

  setAvailableUserBuildings() {
    return this.store.select('buildingsState').map(s => s.buildings).subscribe(buildings => {
      buildings.forEach(building => {
        this.buildingsMap[building.id] = building;
      });
      this.availableUserBuildings = this.getAvailableUserBuildings(buildings);
    });
  }

  getAvailableUserBuildings(buildings: Building[]) : Building[] {
    // Ensures all required data is available
    // Maps and filters user's buildings depending on the user's queued buildings
    let userBuildings = buildings.filter(b => b.owned);
    // Checks if there is a next available level and sets building as maxLevel
    userBuildings = userBuildings.map(building => {
      let nextBuilding = this.buildingsMap[building.id + 1000];
      if (nextBuilding) {
        return new Building(Object.assign({}, building, {nextLevelId: nextBuilding.id}));
      }
      return new Building(Object.assign({}, building, {maxLevel: true}));
    })

    // Get all buildings that the user does not already have
    let newBuildings = buildings.filter((building) => {
      // If the level is > 1
      // Or if the user has this building already active
      if (building.level > 1 || userBuildings.find(userBuilding => userBuilding.typeId == building.typeId)) {
        return false;
      }
      return true;
    });

    let availableBuildings = newBuildings.concat(userBuildings);
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

  addNewBuildingToQueue(buildingId: number) {
    this.availableUserBuildings = this.availableUserBuildings.map(building => {
      if (building.id === buildingId) {
        return new Building(Object.assign({}, building, {inProgress: true}));
      }
      return building;
    })
    this.store.dispatch(new BuildingsQueueActions.AddBuildingToQueue(buildingId));
  }

  upgradeBuilding(building: Building) {
    this.store.dispatch(new BuildingsQueueActions.UpgradeBuilding(building));
  }

  cancelBuilding(building: Building) {
    this.store.dispatch(new BuildingsQueueActions.CancelBuilding(building.id));
  }
}
