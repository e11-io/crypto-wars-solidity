import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import { of } from 'rxjs/observable/of';

import { Web3Service } from './web3.service';
import { ContractsService } from './contracts.service';




@Injectable()
export class AssetsRequirementsService {

  constructor(
    private store: Store<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService
  ){

  }

  getAssetsRequirements(ids: any[]) {
    return Observable.forkJoin(
      ids.map(id => {
        return this.web3Service.callContract(
          this.contractsService.AssetsRequirementsInstance.getRequirements,
          [id]
        ).then((result) => {
          return result;
        })
      })
    );
  }

}
