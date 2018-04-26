import { createSelector } from "@ngrx/store";
import { CryptoWarsState } from './app.state';

export const selectBuildings = (state: CryptoWarsState) => state.app.buildingsList;
export const selectBlockNumber = (state: CryptoWarsState) => state.web3.lastBlock;

export const selectActiveBuildings = createSelector(selectBuildings,
                                                    selectBlockNumber,
                                                    (buildings: any, blockNumber: number) => {
  let activeBuildings = buildings.filter(b => b.active || b.endBlock <= blockNumber);
  return activeBuildings;
})
