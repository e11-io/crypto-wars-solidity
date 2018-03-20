import { UserVillageActions } from './user-village.actions';

export interface UserVillageState {
  villageName: string,
  loading: boolean,
  error: string
}

const initialUserVillageState: UserVillageState = {
  villageName: '',
  loading: false,
  error: ''
};

export function userVillage (state = initialUserVillageState, action: UserVillageActions.Actions) {
  switch (action.type) {

    case UserVillageActions.Types.GET_VILLAGE_NAME:
      return Object.assign({}, state, {loading: true, error: null})

    case UserVillageActions.Types.GET_VILLAGE_NAME_SUCCESS:
      return Object.assign({}, state, {
        villageName: action.payload.substr(0, 25), // Max 25 characters
        loading: false
      })

    case UserVillageActions.Types.GET_VILLAGE_NAME_FAILURE:
      return Object.assign({}, state, {
        loading: false,
        error: action.payload
      })

    case UserVillageActions.Types.CREATE_VILLAGE:
      return Object.assign({}, state, {loading: true, error: null})

    case UserVillageActions.Types.CREATE_VILLAGE_SUCCESS:
      return Object.assign({}, state, {loading: false})

    case UserVillageActions.Types.CREATE_VILLAGE_FAILURE:
      return Object.assign({}, state, {loading: false, error: action.payload})

    default:
      return state;
  }
}
