import { initialPlayerResourcesState } from './player-resources.state';
import { PlayerResourcesActions } from './player-resources.actions';
import { Status } from '../../shared/status.model';

export function playerResourcesReducer (state = initialPlayerResourcesState, action: PlayerResourcesActions.Actions) {
  switch (action.type) {
    case PlayerResourcesActions.Types.GET_PLAYER_RESOURCES:
      return Object.assign({}, state, {
        status: new Status({ loading: true })
      })

    case PlayerResourcesActions.Types.GET_PLAYER_RESOURCES_SUCCESS:
      return Object.assign({}, state, {
        gold:    action.payload[0],
        crystal: action.payload[1],
        quantum: action.payload[2],
        status:  new Status(),
      });

    case PlayerResourcesActions.Types.GET_PLAYER_RESOURCES_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error:   action.payload.status.error })
      });

    case PlayerResourcesActions.Types.SET_RATES_AND_CAPACITY:
      return Object.assign({}, state, {
        rates: Object.assign({}, state.rates, {
          gold:    action.payload.goldRate,
          crystal: action.payload.crystalRate,
        }),
        goldCapacity:    action.payload.goldCapacity,
        crystalCapacity: action.payload.crystalCapacity,
        status:          new Status(),
      });

    default:
      return state;
  }
}
