import { Component, OnInit, Input } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { Router } from "@angular/router";

import { Web3Actions } from '../../core/web3/web3.actions';
import { UserResourcesActions } from '../../core/user-resources/user-resources.actions';
import { UserActions } from '../../core/user/user.actions';
import { BuildingsQueueActions } from '../../core/buildings-queue/buildings-queue.actions';
import { BuildingsDataActions } from '../../core/buildings-data/buildings-data.actions';
import { UserVillageActions } from '../../core/user-village/user-village.actions';

import 'rxjs/add/operator/take';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/filter';
import { AbstractContainerComponent } from '../shared/components/abstract-container.component';
import { CryptoWarsState } from '../app.reducer';

import { Web3Service } from '../shared/services/web3.service';
import { ContractsService } from '../shared/services/contracts.service';
import { getCurrentBlockFromStore, getPercentBetweenBlocks, getRemainingSeconds } from '../shared/util/helpers';

@Component({
  selector: 'e11-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})

export class DashboardComponent extends AbstractContainerComponent {

  numbers$: Observable<number[]>;
  userResources$: Observable<any>;

  buildingsData: any;
  buildingsInQueue: any;
  userBalance: number;
  numbers: number[];
  userBuildings: any[];
  userResources: any  = {};
  villageName: string;

  constructor(public store: Store<CryptoWarsState>,
              private web3Service: Web3Service,
              private contractsService: ContractsService,
              private router: Router) {
    super(store);


    this.addToSubscriptions(
      this.setUserBalance(),
      this.setUserResources(),
      this.setBuildingsInQueue(),
      this.setUserBuildings(),
      this.setBuildingsData(),
      this.setVillageName()
    );

  }

  setUserBalance() {
    return this.store.select(s => s.userState).subscribe(user => {
      this.userBalance = user.e11Balance;
    });
  }

  setUserResources() {
    return this.store.select('userResourcesState').subscribe(userResources => {
      this.userResources = userResources;
    });
  }

  setBuildingsInQueue() {

    return this.store.select('buildingsState').distinctUntilChanged().subscribe(buildingsState => {
      this.buildingsInQueue = buildingsState.buildings.filter(building => building.inQueue).map(building => {
        let currentBlock = getCurrentBlockFromStore(this.store);
        if (building.endBlock <= currentBlock) {
          return Object.assign({}, building, {
            finished: true,
            percent: 100,
            remainingSeconds: 0,
          })
        }
        return Object.assign({}, building, {
          finished: false,
          percent: getPercentBetweenBlocks(building.startBlock, building.endBlock, currentBlock),
          remainingSeconds: getRemainingSeconds(building.endBlock, this.store),
        })
      });

    this.buildingsInQueue = this.buildingsInQueue.sort((a, b) => a.endBlock - b.endBlock);
    })
  }

  setBuildingsData() {
    return this.store.select('buildingsDataState').subscribe(buildingsDataState => {
      this.buildingsData = buildingsDataState.buildings;
    });
  }

  setUserBuildings() {
    return this.store.select('userBuildingsState').subscribe(userBuildings => {
      this.userBuildings = userBuildings.buildings;
    })
  }

  setVillageName() {
    return this.store.select('userVillageState').subscribe(userVillage => {
      this.villageName = userVillage.villageName;
    });
  }


  goToBuildings() {
    this.router.navigate(['/assets/buildings']);
  }

}
