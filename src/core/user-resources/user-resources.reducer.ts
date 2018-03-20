import { UserResourcesActions } from './user-resources.actions';

export interface UserResourcesState {
  gold: number;
  crystal: number;
  quantum: number;
  rates: any;
  goldCapacity: number;
  crystalCapacity: number;
  loading: boolean;
}

const initialUserResourcesState: UserResourcesState = {
  gold: 0,
  crystal: 0,
  quantum: 0,
  rates: {
    gold: 0,
    crystal: 0,
  },
  goldCapacity: 0,
  crystalCapacity: 0,
  loading: false
};

export function userResources (state = initialUserResourcesState, action: UserResourcesActions.Actions) {
  switch (action.type) {
    case UserResourcesActions.Types.GET_USER_RESOURCES:
      return Object.assign({}, state, {loading: true, error: null})

    case UserResourcesActions.Types.GET_USER_RESOURCES_SUCCESS:
      return Object.assign({}, state, {
        gold: action.payload[0],
        crystal: action.payload[1],
        quantum: action.payload[2],
        loading: false
      });

    case UserResourcesActions.Types.GET_USER_RESOURCES_FAILURE:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      });

    case UserResourcesActions.Types.SET_RATES_AND_CAPACITY:
      return Object.assign({}, state, {
        loading: false,
        rates: Object.assign({}, state.rates, {
          gold: action.payload.goldRate,
          crystal: action.payload.crystalRate
        }),
        goldCapacity: action.payload.goldCapacity,
        crystalCapacity: action.payload.crystalCapacity
      });

    default:
      return state;
  }
}
