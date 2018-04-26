import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';

import { ContractsService } from '../../../shared/contracts.service';
import { Web3Service } from '../../../web3/web3.service';

@Injectable()
export class PlayerBuildingsService {

  constructor(private store: Store<any>,
              private contractsService: ContractsService,
              private web3Service: Web3Service){

  }

  getPlayerBuildings(activeAccount: string, playerBuildingsLength: number) {
    let indexes: any[] = [];
    for (var i = 0; i < playerBuildingsLength; i++) {
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
