import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { ContractsService } from '../../shared/contracts.service';
import { Web3Service } from '../../web3/web3.service';

import { updateAndfilterUniqueTargets } from '../../../app/shared/util/helpers';

import { PlayerTarget } from './player-target.model';

@Injectable()
export class PlayerTargetsService {

  constructor(private contractsService: ContractsService,
              private store: Store<any>,
              private web3Service: Web3Service){

  }

  getEvents(data) {
    return this.web3Service.getEvents(
      this.contractsService.PointsSystemInstance.PointsChanged,
      data.currentBlock,
      data.searchThreshold
    ).then((result: any) => {
        if (result.error) {
          return {error: result.error};
        }
        result.data.reverse();
        // address(user) -> number(block)
        let addressesObject = {};
        result.data = result.data.filter(event => {
          if (!addressesObject[event.args.user] || addressesObject[event.args.user] < event.blockNumber) {
            addressesObject[event.args.user] = event.blockNumber;
            return true;
          }
        });
        let newTargets = result.data.map(event => {
          return new PlayerTarget({
            address: event.args.user,
            block: event.blockNumber,
            points: event.args.finalPoints.toNumber(),
          });
        })
        let addressBlockMap = {};
        data.targets.forEach(target => addressBlockMap[target.address] = target.block);
        newTargets = newTargets.filter(target => {
          if (!addressBlockMap[target.address] || target.block > addressBlockMap[target.address]) {
            return true;
          }
        });
        data.targets = updateAndfilterUniqueTargets(data.targets.concat(newTargets));
        return data;
      }
    )
  }

}
