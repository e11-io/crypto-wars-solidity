import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/observable/of';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { ContractsService } from '../../shared/contracts.service';
import { Web3Service } from '../../web3/web3.service';

import { VillageInfo } from './village-info.model';

@Injectable()
export class PlayerVillageService {

  constructor(private contractsService: ContractsService,
              private web3Service: Web3Service){

  }

  getUserInfo(from: string, users: string[]) {
    if (!users || users.length == 0) {
      return Observable.of([]);
    }
    return Observable.forkJoin(
      users.map(user => {
        return this.web3Service.callContract(
          this.contractsService.UserVillageInstance.getUserInfo,
          [user, {from: from}]
        ).then((result) => {
          if (result.error) {
            return;
          }
          let unitsIds = result[2].map(ids => ids.toNumber()); // unitsIds
          let unitsQuantities =  result[3].map(quantity => quantity.toNumber()); // unitsQuantities

          // Re-order stats 0: HP, 1: DEF, 2: ATK
          // to             0: ATK, 1: DEF, 2: HP
          let battleStats = result[4].map(stat => stat.toNumber());
          battleStats = [battleStats[2], battleStats[1], battleStats[0]];

          return new VillageInfo({
            address: user,
            username: result[0], // username
            villageName: result[1], // villageName
            unitsIds: unitsIds.filter((unit, i) => unitsQuantities[i] > 0), // unitsIds
            unitsQuantities: unitsQuantities.filter(quantity => quantity > 0), // unitsQuantities
            battleStats: battleStats, // battleStats
            resources: result[5].map(resource => resource.toNumber()), // resources
            canAttack: result[6],
            canTakeRevenge: result[7]
          });
        })
      })
    );
  }

  getUserPoints(user: string) {
    return fromPromise(this.web3Service.callContract(
      this.contractsService.PointsSystemInstance.usersPoints,
      [user]
    ).then((result) => {
      if (!result || result.error) {
        return { error: result? result.error : 'unknown' };
      }
      return { points: result };
    }));
  }

}
