import { BuildingsActions } from './buildings.actions';
import { Building } from './building.model';

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
        let inProgress: any = null;
        if (queueBuilding) {
          if (queueBuilding.endBlock < action.payload.blockNumber) {
            inProgress = false;
          } else {
            inProgress = true;
          }
        }

        return new Building(Object.assign({}, dataBuilding, queueBuilding, userBuilding, {
          inProgress
        }));
      })

      return Object.assign({}, state, {
        buildings: buildings,
        loading: false
      })

    default:
      return state;
  }
}
