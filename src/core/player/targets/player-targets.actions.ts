import { Action } from '@ngrx/store';
import { type } from '../../shared/util/type';

export namespace PlayerTargetsActions {

  export const Types = {
    SELECT_TARGET:               type('[Player Targets] Select Target'),
    SET_TARGET_SUCCESS:          type('[Player Targets] Set Target Success'),
    SET_TARGET_FAILURE:          type('[Player Targets] Set Target Failure'),
    CLEAR_TARGETS:               type('[Player Targets] Clear Targets'),
    SET_TARGETS:                 type('[Player Targets] Set Targets'),
    GET_TARGET:                  type('[Player Targets] Get Target'),
    GET_TARGETS:                 type('[Player Targets] Get Targets'),
    GET_TARGETS_SUCCESS:         type('[Player Targets] Get Targets Success'),
    GET_TARGETS_FAILURE:         type('[Player Targets] Get Targets Failure'),
    SET_CURRENT_BLOCK:           type('[Player Targets] Set Current Block'),
    SET_OLDEST_BLOCK:            type('[Player Targets] Set Oldest Block'),
  }

  export class SelectTarget implements Action {
    type = Types.SELECT_TARGET;

    constructor(public payload: any) { }
  }

  export class SetTargetSuccess implements Action {
    type = Types.SET_TARGET_SUCCESS;
    payload: any;

    constructor() { }
  }

  export class SetTargetFailure implements Action {
    type = Types.SET_TARGET_FAILURE;

    constructor(public payload: any) { }
  }

  export class ClearTargets implements Action {
    type = Types.CLEAR_TARGETS;
    payload: any;
    constructor() { }
  }

  export class SetTargets implements Action {
    type = Types.SET_TARGETS;

    constructor(public payload: any) { }
  }

  export class GetTarget implements Action {
    type = Types.GET_TARGET;

    constructor(public payload: any) { }
  }

  export class GetTargets implements Action {
    type = Types.GET_TARGETS;
    payload: any;
    constructor() { }
  }
  export class GetTargetsSuccess implements Action {
    type = Types.GET_TARGETS_SUCCESS;
    payload: any;

    constructor() { }
  }
  export class GetTargetsFailure implements Action {
    type = Types.GET_TARGETS_FAILURE;

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

  export type Actions
    = SelectTarget
    | SetTargetSuccess
    | SetTargetFailure
    | ClearTargets
    | GetTarget
    | SetTargets
    | GetTargets
    | GetTargetsSuccess
    | GetTargetsFailure
    | SetCurrentBlock
    | SetOldestBlock
}
