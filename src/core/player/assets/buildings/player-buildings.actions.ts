import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace PlayerBuildingsActions {

  export const Types = {
    GET_PLAYER_BUILDINGS:                type('[Player Buildings] Get Player Buildings'),
    GET_PLAYER_BUILDINGS_SUCCESS:        type('[Player Buildings] Get Player Buildings Success'),
    GET_PLAYER_BUILDINGS_FAILURE:        type('[Player Buildings] Get Player Buildings Failure'),
    GET_PLAYER_BUILDINGS_LENGTH:         type('[Player Buildings] Get Player Buildings Length'),
    GET_PLAYER_BUILDINGS_LENGTH_FAILURE: type('[Player Buildings] Get Player Buildings Length Failure'),
  }

  export class GetPlayerBuildings implements Action {
    type = Types.GET_PLAYER_BUILDINGS;

    constructor(public payload: number) { }
  }

  export class GetPlayerBuildingsSuccess implements Action {
    type = Types.GET_PLAYER_BUILDINGS_SUCCESS;

    constructor(public payload: any[]) { }
  }

  export class GetPlayerBuildingsFailure implements Action {
    type = Types.GET_PLAYER_BUILDINGS_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetPlayerBuildingsLength implements Action {
    type = Types.GET_PLAYER_BUILDINGS_LENGTH;
    payload;

    constructor() { }
  }

  export class GetPlayerBuildingsLengthFailure implements Action {
    type = Types.GET_PLAYER_BUILDINGS_LENGTH_FAILURE;

    constructor(public payload: any) { }
  }


  export type Actions
    = GetPlayerBuildings
    | GetPlayerBuildingsSuccess
    | GetPlayerBuildingsFailure
    | GetPlayerBuildingsLength
    | GetPlayerBuildingsLengthFailure
}
