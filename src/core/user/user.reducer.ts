import { UserActions } from './user.actions';

export interface UserState {
  ethBalance: number,
  e11Balance: number,
  loading: boolean
}

const initialUserState: UserState = {
  ethBalance: 0,
  e11Balance: 0,
  loading: false
};

export function user (state = initialUserState, action: UserActions.Actions) {
  switch (action.type) {

    case UserActions.Types.GET_ETH_BALANCE:
      return Object.assign({}, state, {loading: true, error: null})

    case UserActions.Types.GET_ETH_BALANCE_SUCCESS:
      return Object.assign({}, state, {
        ethBalance: action.payload / Math.pow(10, 18),
        loading: false
      });

    case UserActions.Types.GET_ETH_BALANCE_FAILURE:
      return Object.assign({}, state, {
        error: action.payload,
        loading: false
      });

    case UserActions.Types.GET_E11_BALANCE:
      return Object.assign({}, state, {loading: true, error: null})

    case UserActions.Types.GET_E11_BALANCE_SUCCESS:
      return Object.assign({}, state, {
        e11Balance: action.payload / Math.pow(10, 18),
        loading: false
      });

    case UserActions.Types.GET_E11_BALANCE_SUCCESS:
      return Object.assign({}, state, {
        error: action.payload,
        loading: false
      });

    default:
      return state;
  }
}
