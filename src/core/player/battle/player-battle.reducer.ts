import { initialPlayerBattleState } from './player-battle.state';
import { PlayerBattleActions } from './player-battle.actions';
import { Status } from '../../shared/status.model';

export function playerBattleReducer (state = initialPlayerBattleState, action: PlayerBattleActions.Actions) {
  switch (action.type) {

    case PlayerBattleActions.Types.SELECT_BATTLE_DETAIL:
      return Object.assign({}, state, {
        expandedBattleDetail: action.payload
      })

    case PlayerBattleActions.Types.SET_BATTLE_HISTORY:
      return Object.assign({}, state, {
        battles: action.payload
      })

    case PlayerBattleActions.Types.GET_BATTLE_HISTORY:
      return Object.assign({}, state, {
        status: new Status({
          error: null,
          loading: true
        })
      })

    case PlayerBattleActions.Types.GET_BATTLE_HISTORY_SUCCESS:
      return Object.assign({}, state, {
        status: new Status()
      })

    case PlayerBattleActions.Types.GET_BATTLE_HISTORY_FAILURE:
      return Object.assign({}, state, {
        status: new Status({
          loading: false,
          error: action.payload
        })
      })

    case PlayerBattleActions.Types.GET_REWARDS_MODIFIERS:
    case PlayerBattleActions.Types.GET_ATTACK_COOLDOWN:
    case PlayerBattleActions.Types.GET_LAST_ATTACK_BLOCK:
      return Object.assign({}, state, {
        status: new Status({
          error: null,
          loading: true
        })
      })
    case PlayerBattleActions.Types.GET_REWARDS_MODIFIERS_FAILURE:
    case PlayerBattleActions.Types.GET_ATTACK_COOLDOWN_FAILURE:
    case PlayerBattleActions.Types.GET_LAST_ATTACK_BLOCK_FAILURE:
      return Object.assign({}, state, {
        status: new Status({
          loading: false,
          error: action.payload
        })
      })

    case PlayerBattleActions.Types.GET_REWARDS_MODIFIERS_SUCCESS:
      return Object.assign({}, state, {
        rewardAttackerModifier: action.payload[0],
        rewardDefenderModifier: action.payload[1],
        status: new Status()
      })

    case PlayerBattleActions.Types.GET_ATTACK_COOLDOWN_SUCCESS:
      return Object.assign({}, state, {
        attackCooldown: action.payload,
        status: new Status()
      })

    case PlayerBattleActions.Types.GET_LAST_ATTACK_BLOCK_SUCCESS:
      return Object.assign({}, state, {
        lastAttackBlock: action.payload,
        status: new Status()
      })

    case PlayerBattleActions.Types.SET_CURRENT_BLOCK:
      return Object.assign({}, state, {
        currentBlock: action.payload
      })

    case PlayerBattleActions.Types.SET_OLDEST_BLOCK:
      return Object.assign({}, state, {
        oldestBlock: action.payload
      })

    default:
      return state;
  }
}
