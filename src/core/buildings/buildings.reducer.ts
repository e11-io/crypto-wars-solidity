import { BuildingsActions } from './buildings.actions';
import { Building } from './building.model';
import { getMissingRequirements } from '../../app/shared/util/helpers';

export interface BuildingsState {
  buildings: any,
  loading: boolean
}

const initialBuildingsState: BuildingsState = {
  buildings: [],
  loading: false
};

export function buildings (state = initialBuildingsState, action: BuildingsActions.Actions) {
  switch (action.type) {

    case BuildingsActions.Types.SET_BUILDINGS:
      let buildings: any = [];
      buildings = action.payload.buildingsData.map(dataBuilding => {
        let queueBuilding = action.payload.buildingsQueue.find(b => b.id == dataBuilding.id);
        let userBuilding = action.payload.userBuildings.find(b => b.id == dataBuilding.id);
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

        return new Building(Object.assign({}, dataBuilding, queueBuilding, userBuilding, {
          assetRequirements,
          inProgress
        }));
      });

      /* Get OwnedBuildings:
       *
       */
      let ownedBuildings = [];
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

      buildings = buildings.map(building => {
        let missingRequirements = getMissingRequirements(building.assetRequirements, ownedBuildings);
        return new Building(Object.assign({}, building, {missingRequirements}));
      });

      return Object.assign({}, state, {
        buildings: buildings,
        loading: false
      })

    default:
      return state;
  }
}
