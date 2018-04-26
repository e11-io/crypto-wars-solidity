import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';

import { ContractsService } from '../../../shared/contracts.service';
import { Web3Service } from '../../../web3/web3.service';

@Injectable()
export class AssetsUnitsDataService {

  constructor(private contractsService: ContractsService,
              private store: Store<any>,
              private web3Service: Web3Service){

  }

  getUnitsData(ids: any[]) {
    return Observable.forkJoin(
      ids.map(id => {
        return this.web3Service.callContract(
          this.contractsService.UnitsDataInstance.units,
          [id]
        ).then((result) => {
          return result;
        })
      })
    );
  }

  getUnitsIds(unitsLength: number) {
    let indexes = [];
    for (var i = 0; i < unitsLength; i++) {
      indexes.push(i);
    }

    return Observable.forkJoin(
      indexes.map(index => {
        return this.web3Service.callContract(
          this.contractsService.UnitsDataInstance.unitIds,
          [index]
        ).then((result) => {
          return result;
        })
      })
    );
  }

  getUnitIdsLength() {
    return Observable.fromPromise(this.web3Service.callContract(
      this.contractsService.UnitsDataInstance.getUnitIdsLength,
      []
    ).then((unitsIds) => {
      if (unitsIds.error) {
        return {error: unitsIds.error};
      }
      return unitsIds;
    }))
  }

}
