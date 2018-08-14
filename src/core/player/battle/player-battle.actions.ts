import { Action } from '@ngrx/store';
import { type } from '../../shared/util/type';

export namespace PlayerBattleActions {

  export const Types = {
    // Attack section
    ATTACK:                             type('[Player Battle] Attack'),
    ATTACK_SUCCESS:                     type('[Player Battle] Attack Success'),
    ATTACK_FAILURE:                     type('[Player Battle] Attack Failure'),
    GET_ATTACK_COOLDOWN:                type('[Player Battle] Get Attack Cooldown'),
    GET_ATTACK_COOLDOWN_SUCCESS:        type('[Player Battle] Get Attack Cooldown Success'),
    GET_ATTACK_COOLDOWN_FAILURE:        type('[Player Battle] Get Attack Cooldown Failure'),
    GET_LAST_ATTACK_BLOCK:              type('[Player Battle] Get Last Attack Block'),
    GET_LAST_ATTACK_BLOCK_SUCCESS:      type('[Player Battle] Get Last Attack Block Success'),
    GET_LAST_ATTACK_BLOCK_FAILURE:      type('[Player Battle] Get Last Attack Block Failure'),
    GET_REWARDS_MODIFIERS:              type('[Player Battle] Get Rewards Modifiers'),
    GET_REWARDS_MODIFIERS_SUCCESS:      type('[Player Battle] Get Rewards Modifiers Success'),
    GET_REWARDS_MODIFIERS_FAILURE:      type('[Player Battle] Get Rewards Modifiers Failure'),
    // Battle History
    SELECT_BATTLE_DETAIL:               type('[Player Battle] Select Battle Detail'),
    CLEAR_BATTLE_HISTORY:               type('[Player Battle] Clear Battle History'),
    SET_BATTLE_HISTORY:                 type('[Player Battle] Set Battle History'),
    GET_BATTLE_HISTORY:                 type('[Player Battle] Get Battle History'),
    GET_BATTLE_HISTORY_SUCCESS:         type('[Player Battle] Get Battle History Success'),
    GET_BATTLE_HISTORY_FAILURE:         type('[Player Battle] Get Battle History Failure'),
    SET_CURRENT_BLOCK:                  type('[Player Battle] Set Current Block'),
    SET_OLDEST_BLOCK:                   type('[Player Battle] Set Oldest Block'),
  }

  export class Attack implements Action {
    type = Types.ATTACK;

    constructor(public payload: any) { }
  }

  export class AttackSuccess implements Action {
    type = Types.ATTACK_SUCCESS;
    payload;

    constructor() { }
  }

  export class AttackFailure implements Action {
    type = Types.ATTACK_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetAttackCooldown implements Action {
    type = Types.GET_ATTACK_COOLDOWN;
    payload;

    constructor() { }
  }

  export class GetAttackCooldownSuccess implements Action {
    type = Types.GET_ATTACK_COOLDOWN_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetAttackCooldownFailure implements Action {
    type = Types.GET_ATTACK_COOLDOWN_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetLastAttackBlock implements Action {
    type = Types.GET_LAST_ATTACK_BLOCK;

    constructor(public payload: any) { }
  }

  export class GetLastAttackBlockSuccess implements Action {
    type = Types.GET_LAST_ATTACK_BLOCK_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetLastAttackBlockFailure implements Action {
    type = Types.GET_LAST_ATTACK_BLOCK_FAILURE;

    constructor(public payload: any) { }
  }

  export class SelectBattleDetail implements Action {
    type = Types.SELECT_BATTLE_DETAIL;

    constructor(public payload: any) { }
  }

  export class ClearBattleHistory implements Action {
    type = Types.CLEAR_BATTLE_HISTORY;
    payload;
    constructor() { }
  }

  export class SetBattleHistory implements Action {
    type = Types.SET_BATTLE_HISTORY;

    constructor(public payload: any) { }
  }

  export class GetBattleHistory implements Action {
    type = Types.GET_BATTLE_HISTORY;
    payload;
    constructor() { }
  }

  export class GetBattleHistorySuccess implements Action {
    type = Types.GET_BATTLE_HISTORY_SUCCESS;
    payload;
    constructor() { }
  }

  export class GetBattleHistoryFailure implements Action {
    type = Types.GET_BATTLE_HISTORY_FAILURE;

    constructor(public payload: any) { }
  }

  export class SetOldestBlock implements Action {
    type = Types.SET_OLDEST_BLOCK;

    constructor(public payload: any) { }
  }
  export class SetCurrentBlock implements Action {
    type = Types.SET_CURRENT_BLOCK;

    constructor(public payload: any) { }
  }

  export class GetRewardsModifiers implements Action {
    type = Types.GET_REWARDS_MODIFIERS;
    payload;
    constructor() { }
  }

  export class GetRewardsModifiersSuccess implements Action {
    type = Types.GET_REWARDS_MODIFIERS_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetRewardsModifiersFailure implements Action {
    type = Types.GET_REWARDS_MODIFIERS_FAILURE;

    constructor(public payload: any) { }
  }

  export type Actions
    = Attack
    | AttackSuccess
    | AttackFailure
    | GetAttackCooldown
    | GetAttackCooldownSuccess
    | GetAttackCooldownFailure
    | GetLastAttackBlock
    | GetLastAttackBlockSuccess
    | GetLastAttackBlockFailure
    | GetRewardsModifiers
    | GetRewardsModifiersSuccess
    | GetRewardsModifiersFailure
    | SelectBattleDetail
    | ClearBattleHistory
    | SetBattleHistory
    | GetBattleHistory
    | GetBattleHistorySuccess
    | GetBattleHistoryFailure
    | SetOldestBlock
    | SetCurrentBlock
}
