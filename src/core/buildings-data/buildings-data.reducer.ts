import { BuildingsDataActions } from './buildings-data.actions';
import { Building } from './buildingData.model';

export interface BuildingsDataState {
  buildings: any,
  loading: boolean
}

const initialBuildingsDataState: BuildingsDataState = {
  buildings: {},
  loading: false
};

export function buildingsData (state = initialBuildingsDataState, action: BuildingsDataActions.Actions) {
  switch (action.type) {
    case BuildingsDataActions.Types.GET_BUILDINGS_DATA:
      return Object.assign({}, state, {loading: true, error: null})

    case BuildingsDataActions.Types.GET_BUILDINGS_DATA_SUCCESS:
      let ids: any = {};
      action.payload.ids.forEach((id, i) => ids[id] = new Building(id, action.payload.buildings[i]));
      return Object.assign({}, state, {
        buildings: Object.assign({}, state.buildings, ids),
        loading: false
      });

    case BuildingsDataActions.Types.GET_BUILDINGS_DATA_FAILURE:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      });

    default:
      return state;
  }
}
