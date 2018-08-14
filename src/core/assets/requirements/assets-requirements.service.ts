import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';

import { ContractsService } from '../../shared/contracts.service';
import { Web3Service } from '../../web3/web3.service';

@Injectable()
export class AssetsRequirementsService {

  constructor(private store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService){

  }

  getAssetsRequirements(ids: any[]) {
    // TODO Improve (must implement max amount of requirements)
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
