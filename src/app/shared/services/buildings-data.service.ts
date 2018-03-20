import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import { of } from 'rxjs/observable/of';

import { Web3Service } from './web3.service';
import { ContractsService } from './contracts.service';




@Injectable()
export class BuildingsDataService {

  constructor(
    private store: Store<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService
  ){

  }

  getBuildingsData(ids: any[]) {
    return Observable.forkJoin(
      ids.map(id => {
        return this.web3Service.callContract(
          this.contractsService.BuildingsDataInstance.buildings,
          [id]
        ).then((result) => {
          return result;
        })
      })
    );
  }

  getBuildingsIds(buildingsLength: number) {
    let indexes = [];
    for (var i = 0; i < buildingsLength; i++) {
      indexes.push(i);
    }

    return Observable.forkJoin(
      indexes.map(index => {
        return this.web3Service.callContract(
          this.contractsService.BuildingsDataInstance.buildingIds,
          [index]
        ).then((result) => {
          return result;
        })
      })
    );
  }

  getBuildingIdsLength() {
    return Observable.fromPromise(this.web3Service.callContract(
      this.contractsService.BuildingsDataInstance.getBuildingIdsLength,
      []
    ).then((buildingsIds) => {
      if (buildingsIds.error) {
        return {error: buildingsIds.error};
      }
      return buildingsIds;
    }))
  }

}
