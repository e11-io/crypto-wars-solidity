import { createSelector } from "@ngrx/store";
import { CryptoWarsState } from './app.reducer';


export const selectBuildings = (state: CryptoWarsState) => state.buildingsState.buildings;
export const selectBlockNumber = (state: CryptoWarsState) => state.web3State.lastBlock;

export const selectActiveBuildings = createSelector(selectBuildings,
                                                    selectBlockNumber,
                                                    (buildings: any, blockNumber: number) => {
  let activeBuildings = buildings.filter(b => b.active || b.endBlock <= blockNumber);
  return activeBuildings;
})
