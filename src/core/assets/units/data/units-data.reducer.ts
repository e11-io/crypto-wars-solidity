import { AssetsUnitsDataActions } from './units-data.actions';
import { DataUnit } from './data-unit.model';
import { initialAssetsUnitsDataState } from './units-data.state';
import { Status } from '../../../shared/status.model';

export function assetsUnitsDataReducer (state = initialAssetsUnitsDataState, action: AssetsUnitsDataActions.Actions) {
  switch (action.type) {
    case AssetsUnitsDataActions.Types.GET_UNITS_DATA:
      return Object.assign({}, state, {
        status: new Status({ loading: true })
      })

    case AssetsUnitsDataActions.Types.GET_UNITS_DATA_SUCCESS:
      let ids: any = {};
      action.payload.ids.forEach((id, i) => ids[id] = new DataUnit(id, action.payload.units[i]));
      return Object.assign({}, state, {
        listMap: Object.assign({}, state.listMap, ids),
        status:  new Status(),
      });

    case AssetsUnitsDataActions.Types.GET_UNITS_DATA_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error }),
      });

    default:
      return state;
  }
}
