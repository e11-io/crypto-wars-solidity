import { AppActions } from './app.actions';
import { initialAppState } from './app.state';

import { Building } from './shared/models/building.model';
import { getMissingRequirements } from './shared/util/helpers';
import { Unit, UnitMap } from './shared/models/unit.model';
import { QueueUnit } from '../core/assets/units/queue/queue-unit.model';
import { PlayerUnit } from '../core/player/assets/units/player-unit.model';


export function appReducer (state = initialAppState, action: AppActions.Actions) {
  switch (action.type) {

    case AppActions.Types.SET_BUILDINGS:
      let buildings: Building[] = [];
      buildings = action.payload.buildingsData.map(dataBuilding => {
        let queueBuilding = action.payload.buildingsQueue.find(b => b.id == dataBuilding.id);
        let playerBuilding = action.payload.playerBuildings.find(b => b.id == dataBuilding.id);
        let key = dataBuilding.id.toString();
        let assetRequirements = action.payload.assetsRequirements[key];
        let inProgress: any = null;
        if (queueBuilding) {
          if (queueBuilding.endBlock < action.payload.blockNumber) {
            inProgress = false;
          } else {
            inProgress = true;
          }
        }

        return new Building(Object.assign({}, dataBuilding, queueBuilding, playerBuilding, {
          assetRequirements,
          inProgress,
          remainingBlocks: queueBuilding? queueBuilding.endBlock - action.payload.blockNumber: null,
        }));
      });

      /* Get OwnedBuildings:
       *
       */
      let ownedBuildings = getOwnedBuildings(buildings);

      buildings = buildings.map(building => {
        let missingRequirements = getMissingRequirements(building.assetRequirements, ownedBuildings);
        return new Building(Object.assign({}, building, {missingRequirements}));
      });

      return Object.assign({}, state, {
        buildingsList: buildings
      })

    case AppActions.Types.SET_UNITS:
      let unitsMap: UnitMap = {};
      action.payload.unitsData.forEach(dataUnit => {
        let key = dataUnit.id.toString();
        let assetRequirements = action.payload.assetsRequirements[key];
        unitsMap[key] = new Unit(Object.assign({}, dataUnit, {
          assetRequirements,
        }));
      });

      let queueUnits: Unit[] = [];
       action.payload.unitsQueue.forEach((queueUnit: QueueUnit) => {
        let key = queueUnit.id.toString();
        let inProgress: any = null;
        if (queueUnit.endBlock < action.payload.blockNumber) {
          inProgress = false;
          unitsMap[key].quantity += queueUnit.quantity;
        } else {
          let unitQuantity = 0;
          if (queueUnit.startBlock < action.payload.blockNumber) {
            let diff = action.payload.blockNumber - queueUnit.startBlock;
            unitQuantity = Math.floor(diff / unitsMap[key].blocks);
          }

          unitsMap[key].quantity += unitQuantity;
          unitsMap[key].quantityInQueue += (queueUnit.quantity - unitQuantity);
          inProgress = true;
        }

        queueUnits.push(new Unit(Object.assign({}, unitsMap[key], queueUnit, {
          inProgress
        })));
      });

      let playerUnits: Unit[] = [];
      playerUnits = action.payload.playerUnits.map((playerUnit: PlayerUnit) => {
        let key = playerUnit.id.toString();
        unitsMap[key].quantity += playerUnit.quantity;
        return new Unit(Object.assign({}, unitsMap[key], playerUnit));
      });


      // Set missing requirements using buildings
      // Set waiting using localUnits
      let playerOwnedBuildings = getOwnedBuildings(action.payload.buildings);
      Object.values(unitsMap).forEach(unit => {
        let missingRequirements = getMissingRequirements(unit.assetRequirements, playerOwnedBuildings);
        let waiting = !!action.payload.localUnits.find(unitId => unitId === unit.id);
        unitsMap[unit.id] = new Unit(Object.assign({}, unit, {
          missingRequirements,
          waiting,
        }));
      });

      return Object.assign({}, state, {
        initialized: true,
        unitsList:   queueUnits.concat(playerUnits),
        unitsMap:    unitsMap,
      })

    default:
      return state;
  }
}

function getOwnedBuildings(buildings: Building[]) {
  let ownedBuildings: Building[] = [];
  for (var i = 0; i < buildings.length; i++) {
    if (buildings[i].owned) {
      if (!buildings[i].inProgress) {
        ownedBuildings.push(buildings[i]);
      } else if (buildings[i].previousLevelId) {
        let previousBuilding = buildings.find(b => b.id == buildings[i].previousLevelId);
        if (previousBuilding) {
          ownedBuildings.push(previousBuilding);
        }
      }
    }
  }
  return ownedBuildings;
}
