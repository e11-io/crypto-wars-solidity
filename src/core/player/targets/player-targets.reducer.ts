import { initialPlayerTargetsState } from './player-targets.state';
import { PlayerTargetsActions } from './player-targets.actions';
import { Status } from '../../shared/status.model';

export function playerTargetsReducer (state = initialPlayerTargetsState, action: PlayerTargetsActions.Actions) {
  switch (action.type) {
    case PlayerTargetsActions.Types.SELECT_TARGET:
      return Object.assign({}, state, {
        expandedTarget: action.payload
      })

    case PlayerTargetsActions.Types.SET_TARGET_SUCCESS:
      return Object.assign({}, state, {
        status: new Status()
      })

    case PlayerTargetsActions.Types.SET_TARGET_FAILURE:
      return Object.assign({}, state, {
        status: new Status({
          loading: false,
          error: action.payload
        })
      })

    case PlayerTargetsActions.Types.SET_TARGETS:
      return Object.assign({}, state, {
        targets: action.payload,
        targetsNonce: state.targetsNonce + 1
      })

    case PlayerTargetsActions.Types.GET_TARGETS:
      return Object.assign({}, state, {
        status: new Status({
          error: null,
          loading: true
        })
      })

    case PlayerTargetsActions.Types.GET_TARGETS_SUCCESS:
      return Object.assign({}, state, {
        status: new Status()
      })

    case PlayerTargetsActions.Types.GET_TARGETS_FAILURE:
      return Object.assign({}, state, {
        status: new Status({
          loading: false,
          error: action.payload
        })
      })

    case PlayerTargetsActions.Types.SET_CURRENT_BLOCK:
      return Object.assign({}, state, {
        currentBlock: action.payload
      })

    case PlayerTargetsActions.Types.SET_OLDEST_BLOCK:
      return Object.assign({}, state, {
        oldestBlock: action.payload
      })

      default:
        return state;
  }
}
