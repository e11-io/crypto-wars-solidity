import { AssetsUnitsQueueActions } from './units-queue.actions';
import { initialAssetsUnitsQueueState } from './units-queue.state';
import { Status } from '../../../shared/status.model';

export function assetsUnitsQueueReducer (state = initialAssetsUnitsQueueState, action: AssetsUnitsQueueActions.Actions) {
  switch (action.type) {

    case AssetsUnitsQueueActions.Types.GET_UNITS_QUEUE:
      return Object.assign({}, state, {
        status: new Status({ loading: true }),
      })

    case AssetsUnitsQueueActions.Types.GET_UNITS_QUEUE_SUCCESS:
      return Object.assign({}, state, {
        list:   action.payload,
        status: new Status(),
      })

    case AssetsUnitsQueueActions.Types.GET_UNITS_QUEUE_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error }),
      })

    case AssetsUnitsQueueActions.Types.ADD_UNIT_TO_QUEUE:
      return Object.assign({}, state, {
        localList: state.localList.concat([action.payload.id]),
        status:    new Status({ loading: true }),
      })

    case AssetsUnitsQueueActions.Types.ADD_UNIT_TO_QUEUE_SUCCESS:
      return Object.assign({}, state, {
        localList: state.localList.filter(unit => unit != action.payload.id),
        status:    new Status(),
      })

    case AssetsUnitsQueueActions.Types.ADD_UNIT_TO_QUEUE_FAILURE:
      return Object.assign({}, state, {
        localList: state.localList.filter(unit => unit != action.payload.id),
        status:    new Status({ error: action.payload.status.error }),
      })

    default:
      return state;
  }
}
