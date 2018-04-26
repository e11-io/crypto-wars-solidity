import { initialPlayerVillageState } from './player-village.state';
import { PlayerVillageActions } from './player-village.actions';
import { Status } from '../../shared/status.model';

export function playerVillageReducer (state = initialPlayerVillageState, action: PlayerVillageActions.Actions) {
  switch (action.type) {

    case PlayerVillageActions.Types.GET_VILLAGE_NAME:
      return Object.assign({}, state, {
        status: new Status({
          error:   null,
          loading: true
        })
      })

    case PlayerVillageActions.Types.GET_VILLAGE_NAME_SUCCESS:
      return Object.assign({}, state, {
        villageName: action.payload.substr(0, 25), // Max 25 characters
        status:      new Status()
      })

    case PlayerVillageActions.Types.GET_VILLAGE_NAME_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error })
      })

    case PlayerVillageActions.Types.CREATE_VILLAGE:
      return Object.assign({}, state, {
        status: new Status({
          error:   null,
          loading: true
        })
      })

    case PlayerVillageActions.Types.CREATE_VILLAGE_SUCCESS:
      return Object.assign({}, state, {
        status: new Status()
      })

    case PlayerVillageActions.Types.CREATE_VILLAGE_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload.status.error })
      })

    default:
      return state;
  }
}
