import { Action } from '@ngrx/store';
import { type } from '../../shared/util/type';

export namespace PlayerResourcesActions {

  export const Types = {
    GET_PLAYER_RESOURCES:         type('[Player Resources] Get Player Resources'),
    GET_PLAYER_RESOURCES_SUCCESS: type('[Player Resources] Get Player Resources Success'),
    GET_PLAYER_RESOURCES_FAILURE: type('[Player Resources] Get Player Resources Failure'),
    GIVE_RESOURCES_TO_PLAYER:     type('[Player Resources] Give Resources To Player'),
    SET_RATES_AND_CAPACITY:       type('[Player Resources] Set Resources Rates and Capacity'),
    LOCK_PLAYER_RESOURCES:        type('[Player Resources] Lock Player Resources'),
    UNLOCK_PLAYER_RESOURCES:      type('[Player Resources] Unlock Player Resources')
  }

  export class GetPlayerResources implements Action {
    type = Types.GET_PLAYER_RESOURCES;
    payload;

    constructor() { }
  }

  export class GetPlayerResourcesSuccess implements Action {
    type = Types.GET_PLAYER_RESOURCES_SUCCESS;

    constructor(public payload: any[]) { }
  }

  export class GetPlayerResourcesFailure implements Action {
    type = Types.GET_PLAYER_RESOURCES_FAILURE;

    constructor(public payload: any) { }
  }

  export class GiveResourcesToPlayer implements Action {
    type = Types.GIVE_RESOURCES_TO_PLAYER;

    constructor(public payload: string) { }
  }

  export class SetRatesAndCapacty implements Action {
    type = Types.SET_RATES_AND_CAPACITY;

    constructor(public payload: any) { }
  }

  export class LockPlayerResources implements Action {
    type = Types.LOCK_PLAYER_RESOURCES;

    constructor(public payload: any) { }
  }

  export class UnlockPlayerResources implements Action {
    type = Types.UNLOCK_PLAYER_RESOURCES;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetPlayerResources
    | GetPlayerResourcesSuccess
    | GetPlayerResourcesFailure
    | GiveResourcesToPlayer
    | SetRatesAndCapacty
    | LockPlayerResources
    | UnlockPlayerResources
}
