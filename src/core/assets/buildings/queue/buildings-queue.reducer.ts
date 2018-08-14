import { AssetsBuildingsQueueActions } from './buildings-queue.actions';
import { initialAssetsBuildingsQueueState } from './buildings-queue.state';
import { QueueBuilding } from './queue-building.model';
import { Status } from '../../../shared/status.model';

export function assetsBuildingsQueueReducer (state = initialAssetsBuildingsQueueState, action: AssetsBuildingsQueueActions.Actions) {
  switch (action.type) {

    case AssetsBuildingsQueueActions.Types.GET_BUILDINGS_QUEUE:
      return Object.assign({}, state, {
        status: new Status()
      })

    case AssetsBuildingsQueueActions.Types.GET_BUILDINGS_QUEUE_SUCCESS:
      return Object.assign({}, state, {
        list:   action.payload,
        status: new Status()
      })

    case AssetsBuildingsQueueActions.Types.GET_BUILDINGS_QUEUE_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload }),
      })

    case AssetsBuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE:
      return Object.assign({}, state, {
        localList: state.localList.concat([action.payload.id]),
        status:    new Status({ loading: true }),
      })

    case AssetsBuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE_SUCCESS:
      return Object.assign({}, state, {
        localList: state.localList.filter(building => building != action.payload.id),
        status:    new Status(),
      })

    case AssetsBuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE_FAILURE:
      return Object.assign({}, state, {
        localList: state.localList.filter(building => building != action.payload.id),
        status:    new Status({ error: action.payload }),
      })

    case AssetsBuildingsQueueActions.Types.UPGRADE_BUILDING:
      return Object.assign({}, state, {
        localList: state.localList.concat([action.payload.id]),
        status:    new Status({ loading: true }),
      })

    case AssetsBuildingsQueueActions.Types.UPGRADE_BUILDING_SUCCESS:
      return Object.assign({}, state, {
        localList: state.localList.filter(building => building != action.payload.id),
        status:    new Status({ loading: true }),
      })

    case AssetsBuildingsQueueActions.Types.UPGRADE_BUILDING_FAILURE:
      return Object.assign({}, state, {
        localList: state.localList.filter(building => building != action.payload.id),
        status:    new Status({ error: action.payload.status.error }),
      })

    case AssetsBuildingsQueueActions.Types.CANCEL_BUILDING:
      return Object.assign({}, state, {
        status: new Status({ loading: true }),
      })

    default:
      return state;
  }
}
