import { initialPlayerUnitsState } from './player-units.state';
import { PlayerUnit } from './player-unit.model';
import { PlayerUnitsActions } from './player-units.actions';
import { Status } from '../../../shared/status.model';

export function playerUnitsReducer (state = initialPlayerUnitsState, action: PlayerUnitsActions.Actions) {
  switch (action.type) {
    case PlayerUnitsActions.Types.GET_PLAYER_UNITS:
      return Object.assign({}, state, {
        status: new Status({ loading: true }),
      })

    case PlayerUnitsActions.Types.GET_PLAYER_UNITS_SUCCESS:
      return Object.assign({}, state, {
        list:   action.payload,
        status: new Status({ error: action.payload }),
      });

    case PlayerUnitsActions.Types.GET_PLAYER_UNITS_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error }),
      });

    default:
      return state;
  }
}
