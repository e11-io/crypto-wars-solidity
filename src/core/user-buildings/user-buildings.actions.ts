import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace UserBuildingsActions {

  export const Types = {
    GET_USER_BUILDINGS: type('[User Buildings] Get User Buildings'),
    GET_USER_BUILDINGS_SUCCESS: type('[User Buildings] Get User Buildings Success'),
    GET_USER_BUILDINGS_FAILURE: type('[User Buildings] Get User Buildings Failure'),
    GET_USER_BUILDINGS_LENGTH: type('[User Buildings] Get User Buildings Length'),
    GET_USER_BUILDINGS_LENGTH_FAILURE: type('[User Buildings] Get User Buildings Length Failure'),
  }

  export class GetUserBuildings implements Action {
    type = Types.GET_USER_BUILDINGS;

    constructor(public payload: number) { }
  }

  export class GetUserBuildingsSuccess implements Action {
    type = Types.GET_USER_BUILDINGS_SUCCESS;

    constructor(public payload: any[]) { }
  }

  export class GetUserBuildingsFailure implements Action {
    type = Types.GET_USER_BUILDINGS_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetUserBuildingsLength implements Action {
    type = Types.GET_USER_BUILDINGS_LENGTH;
    payload;

    constructor() { }
  }

  export class GetUserBuildingsLengthFailure implements Action {
    type = Types.GET_USER_BUILDINGS_LENGTH_FAILURE;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetUserBuildings
    | GetUserBuildingsSuccess
    | GetUserBuildingsFailure
    | GetUserBuildingsLength
    | GetUserBuildingsLengthFailure
}
