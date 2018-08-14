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
      return Object.assign({}, state, {
        listMap: action.payload,
        status:  new Status(),
      });

    case AssetsBuildingsDataActions.Types.GET_BUILDINGS_DATA_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.error }),
      });

    default:
      return state;
  }
}
