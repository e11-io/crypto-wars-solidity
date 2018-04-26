import { initialPlayerBuildingsState } from './player-buildings.state';
import { PlayerBuilding } from './player-building.model';
import { PlayerBuildingsActions } from './player-buildings.actions';
import { Status } from '../../../shared/status.model';

export function playerBuildingsReducer (state = initialPlayerBuildingsState, action: PlayerBuildingsActions.Actions) {
  switch (action.type) {
    case PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS:
      return Object.assign({}, state, {
        status: new Status({ loading: true }),
      })

    case PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS_SUCCESS:
      return Object.assign({}, state, {
        list:   action.payload,
        status: new Status(),
      });

    case PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error }),
      });

    case PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS_LENGTH:
    return Object.assign({}, state, {
      status: new Status({ loading: true }),
    })

    case PlayerBuildingsActions.Types.GET_PLAYER_BUILDINGS_LENGTH_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error }),
      });

    default:
      return state;
  }
}
