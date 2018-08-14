import { initialPlayerArmyState } from './player-army.state';
import { PlayerArmyActions } from './player-army.actions';
import { Status } from '../../shared/status.model';

export function playerArmyReducer (state = initialPlayerArmyState, action: PlayerArmyActions.Actions) {
  switch (action.type) {

    case PlayerArmyActions.Types.SET_ARMY:
      return action.payload;

      default:
        return state;
  }
}
