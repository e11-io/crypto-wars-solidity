import { BuildingsQueueActions } from './buildings-queue.actions';

export interface BuildingsQueueState {
  buildings: any,
  loading: boolean,
  localBuildings: any,
}

const initialBuildingsQueueState: BuildingsQueueState = {
  buildings: [],
  loading: false,
  localBuildings: [],
};

export function buildingsQueue (state = initialBuildingsQueueState, action: BuildingsQueueActions.Actions) {
  switch (action.type) {

    case BuildingsQueueActions.Types.GET_BUILDINGS_QUEUE:
      return Object.assign({}, state, {loading: true, error: null})

    case BuildingsQueueActions.Types.GET_BUILDINGS_QUEUE_SUCCESS:
      return Object.assign({}, state, {
        buildings: action.payload,
        loading: false
      })

    case BuildingsQueueActions.Types.GET_BUILDINGS_QUEUE_FAILURE:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })

    case BuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE:
      return Object.assign({}, state, {
        error: null,
        loading: true,
        localBuildings: state.localBuildings.concat([action.payload]),
      })

    case BuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE_SUCCESS:
      return Object.assign({}, state, {
        loading: false,
        localBuildings: state.localBuildings.filter(building => building != action.payload),
      })

    case BuildingsQueueActions.Types.ADD_BUILDING_TO_QUEUE_FAILURE:
      return Object.assign({}, state, {
        error: action.payload,
        loading: false,
        localBuildings: state.localBuildings.filter(building => building != action.payload),
      })

    case BuildingsQueueActions.Types.UPGRADE_BUILDING:
      return Object.assign({}, state, {
        error: null,
        loading: true,
        localBuildings: state.localBuildings.concat([action.payload.id])
      })

    case BuildingsQueueActions.Types.UPGRADE_BUILDING_SUCCESS:
      return Object.assign({}, state, {
        loading: true,
        localBuildings: state.localBuildings.filter(building => building != action.payload),
      })

    case BuildingsQueueActions.Types.UPGRADE_BUILDING_FAILURE:
      return Object.assign({}, state, {
        error: action.payload,
        loading: false,
        localBuildings: state.localBuildings.filter(building => building != action.payload),
      })

    case BuildingsQueueActions.Types.CANCEL_BUILDING:
      return Object.assign({}, state, {loading: true, error: null})



    default:
      return state;
  }
}
