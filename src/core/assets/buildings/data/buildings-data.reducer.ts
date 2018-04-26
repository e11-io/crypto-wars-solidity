import { AssetsBuildingsDataActions } from './buildings-data.actions';
import { DataBuilding } from './data-building.model';
import { initialAssetsBuildingsDataState } from './buildings-data.state';
import { Status } from '../../../shared/status.model';

export function assetsBuildingsDataReducer (state = initialAssetsBuildingsDataState, action: AssetsBuildingsDataActions.Actions) {
  switch (action.type) {
    case AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA:
      return Object.assign({}, state, {
        status: new Status({ loading: true }),
      })

    case AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA_SUCCESS:
      let ids: any = {};
      action.payload.ids.forEach((id, i) => ids[id] = new DataBuilding(id, action.payload.buildings[i]));
      return Object.assign({}, state, {
        listMap: Object.assign({}, state.listMap, ids),
        status:  new Status(),
      });

    case AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error }),
      });

    default:
      return state;
  }
}
