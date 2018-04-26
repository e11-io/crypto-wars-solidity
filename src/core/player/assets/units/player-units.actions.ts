import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace PlayerUnitsActions {

  export const Types = {
    GET_PLAYER_UNITS:                type('[Player Units] Get Player Units'),
    GET_PLAYER_UNITS_SUCCESS:        type('[Player Units] Get Player Units Success'),
    GET_PLAYER_UNITS_FAILURE:        type('[Player Units] Get Player Units Failure'),
    GET_PLAYER_UNITS_LENGTH:         type('[Player Units] Get Player Units Length'),
    GET_PLAYER_UNITS_LENGTH_FAILURE: type('[Player Units] Get Player Units Length Failure'),
  }

  export class GetPlayerUnits implements Action {
    type = Types.GET_PLAYER_UNITS;

    constructor(public payload: number) { }
  }

  export class GetPlayerUnitsSuccess implements Action {
    type = Types.GET_PLAYER_UNITS_SUCCESS;

    constructor(public payload: any[]) { }
  }

  export class GetPlayerUnitsFailure implements Action {
    type = Types.GET_PLAYER_UNITS_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetPlayerUnitsLength implements Action {
    type = Types.GET_PLAYER_UNITS_LENGTH;
    payload;

    constructor() { }
  }

  export class GetPlayerUnitsLengthFailure implements Action {
    type = Types.GET_PLAYER_UNITS_LENGTH_FAILURE;

    constructor(public payload: any) { }
  }


  export type Actions
    = GetPlayerUnits
    | GetPlayerUnitsSuccess
    | GetPlayerUnitsFailure
    | GetPlayerUnitsLength
    | GetPlayerUnitsLengthFailure
}
