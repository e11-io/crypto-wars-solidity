import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { ContractsService } from '../../../shared/contracts.service';
import { Web3Service } from '../../../web3/web3.service';

@Injectable()
export class AssetsUnitsDataService {

  constructor(private contractsService: ContractsService,
              private store: Store<any>,
              private web3Service: Web3Service){

  }

  getUnitsData() {
    return Observable.forkJoin(
      ['getAllUnitsA', 'getAllUnitsB'].map(functionName =>
        this.web3Service.callContract(
          this.contractsService.UnitsDataInstance[functionName],
          []
        ).then((result) => {
          return result;
        })
      )
    );
  }

}
