import { createSelector } from "@ngrx/store";
import { CryptoWarsState } from './app.state';
import { PlayerResourcesState } from "../core/player/resources/player-resources.state";

export const selectBuildings = (state: CryptoWarsState) => state.app.buildingsList;
export const selectBlockNumber = (state: CryptoWarsState) => state.web3.lastBlock;

export const selectActiveBuildings = createSelector(selectBuildings,
                                                    selectBlockNumber,
                                                    (buildings: any, blockNumber: number) => {
  let activeBuildings = buildings.filter(b => b.active || b.endBlock <= blockNumber);
  return activeBuildings;
})

export const selectUserResources = (state: CryptoWarsState) => state.player.resources;

export const selectPlayerResources = createSelector((state: CryptoWarsState) => state.player.resources,
                                                    (playerResourcesState: PlayerResourcesState) => {

  let obj = {
    gold: playerResourcesState.gold - playerResourcesState.lockedGold,
    crystal: playerResourcesState.crystal - playerResourcesState.lockedCrystal,
    quantum: playerResourcesState.quantum,
    goldCapacity: playerResourcesState.goldCapacity,
    crystalCapacity: playerResourcesState.crystalCapacity,
    rates: playerResourcesState.rates,
    status: playerResourcesState.status,
  }

  return obj;
})
