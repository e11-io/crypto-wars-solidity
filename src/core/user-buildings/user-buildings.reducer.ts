import { UserBuildingsActions } from './user-buildings.actions';

export interface UserBuildingsState {
  buildings: any[];
  loading: boolean;
}

const initialUserBuildingsState: UserBuildingsState = {
  buildings: [],
  loading: false
};

export function userBuildings (state = initialUserBuildingsState, action: UserBuildingsActions.Actions) {
  switch (action.type) {
    case UserBuildingsActions.Types.GET_USER_BUILDINGS:
      return Object.assign({}, state, {loading: true, error: null})

    case UserBuildingsActions.Types.GET_USER_BUILDINGS_SUCCESS:
      return Object.assign({}, state, {
        buildings: action.payload,
        loading: false
      });

    case UserBuildingsActions.Types.GET_USER_BUILDINGS_FAILURE:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      });

    default:
      return state;
  } 
}
