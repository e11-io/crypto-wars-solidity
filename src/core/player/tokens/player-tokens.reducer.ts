import { initialPlayerTokensState } from './player-tokens.state';
import { PlayerTokensActions } from './player-tokens.actions';
import { Status } from '../../shared/status.model';

export function playerTokensReducer (state = initialPlayerTokensState, action: PlayerTokensActions.Actions) {
  switch (action.type) {

    case PlayerTokensActions.Types.GET_ETH_BALANCE:
      return Object.assign({}, state, {
        status: new Status({
          error:   null,
          loading: true
        })
      })

    case PlayerTokensActions.Types.GET_ETH_BALANCE_SUCCESS:
      return Object.assign({}, state, {
        ethBalance: action.payload / Math.pow(10, 18),
        status:     new Status()
      });

    case PlayerTokensActions.Types.GET_ETH_BALANCE_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error })
      });

    case PlayerTokensActions.Types.GET_E11_BALANCE:
      return Object.assign({}, state, {
        status: new Status({
          error:   null,
          loading: true
        })
      })

    case PlayerTokensActions.Types.GET_E11_BALANCE_SUCCESS:
      return Object.assign({}, state, {
        e11Balance: action.payload / Math.pow(10, 18),
        status:     new Status({ loading: false })
      });

    case PlayerTokensActions.Types.GET_E11_BALANCE_SUCCESS:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload })
      });

    case PlayerTokensActions.Types.GET_E11_BALANCE_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error })
      });

    default:
      return state;
  }
}
