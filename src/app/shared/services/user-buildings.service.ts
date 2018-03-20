import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import { of } from 'rxjs/observable/of';

import { Web3Service } from './web3.service';
import { ContractsService } from './contracts.service';

@Injectable()
export class UserBuildingsService {

  constructor(
    private store: Store<any>,
    private web3Service: Web3Service,
    private contractsService: ContractsService
  ){

  }

  getUserBuildings(activeAccount: string, userBuildingsLength: number) {
    let indexes: any[] = [];
    for (var i = 0; i < userBuildingsLength; i++) {
      indexes.push(i);
    }

    return Observable.forkJoin(
      indexes.map(index => {
        return this.web3Service.callContract(
          this.contractsService.UserBuildingsInstance.userBuildings,
          [activeAccount, index, {from: activeAccount}]
        ).then((result) => {
          if (!result || result.error) {
            return result;
          }
          let obj = {
            id: result[0].toNumber(),
            index: index,
            level: Math.floor(result[0].toNumber() / 1000) || 1,
            active: result[1]
          }
          return obj;
        })
      })
    );
  }

}
