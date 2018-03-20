import { environment } from '../../../environments/environment';
import { Store } from '@ngrx/store';

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
  store.select('web3State').take(1).subscribe(web3 => {
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
