import { Store } from '@ngrx/store';

import { environment } from '../../../environments/environment';

import * as selectors from '../../app.selectors';
import { Building } from '../models/building.model';

export function convertBlocksToSeconds(blocks: number): number {
  return (blocks * environment.blockTime);
}

export function getRemainingSecondsBetween(fromBlock: number, toBlock: number): number {
  return (toBlock - fromBlock) * environment.blockTime;
}

export function getRemainingSeconds(toBlock: number, store: Store<any>): number {
  return getRemainingSecondsBetween(getCurrentBlockFromStore(store), toBlock);
}

export function getCurrentBlockFromStore(store: Store<any>): number {
  let blockNumber: number = 0;
  store.select('web3').take(1).subscribe(web3 => {
    blockNumber = web3.lastBlock;
  });
  return blockNumber;
}

export function getPercentBetweenBlocks(startBlock: number, endBlock: number, currentBlock: number) {
  if (startBlock > currentBlock) {
    return 0;
  }

  return Math.round((currentBlock - startBlock) * 100 / (endBlock - startBlock));
}

export function getMissingRequirements(requirements: any, activeBuildings: Building[]) {
  if (!requirements) {
    return [];
  }
  let missingRequirements: any = [];
  for (var i = 0; i < requirements.length; i++) {
    let building = activeBuildings.find(build => {
      if (build.typeId === requirements[i] % 1000) {
        return true;
      }
    });
    if (!building || building.level < (((requirements[i] - (requirements[i] % 1000)) / 1000) % 1000)) {
      missingRequirements.push(requirements[i]);
    }
  }
  return missingRequirements;
}
