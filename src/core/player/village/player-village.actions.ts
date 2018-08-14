import { Action } from '@ngrx/store';
import { type } from '../../shared/util/type';

export namespace PlayerVillageActions {

  export const Types = {
    GET_VILLAGE_NAME:         type('[Player Village] Get Village Name'),
    GET_VILLAGE_NAME_SUCCESS: type('[Player Village] Get Village Name Success'),
    GET_VILLAGE_NAME_FAILURE: type('[Player Village] Get Village Name Failure'),
    GET_USER_POINTS:          type('[Player Village] Get User Points'),
    GET_USER_POINTS_SUCCESS:  type('[Player Village] Get User Points Success'),
    GET_USER_POINTS_FAILURE:  type('[Player Village] Get User Points Failure'),
    CREATE_VILLAGE:           type('[Player Village] Create Village'),
    CREATE_VILLAGE_SUCCESS:   type('[Player Village] Create Village Success'),
    CREATE_VILLAGE_FAILURE:   type('[Player Village] Create Village Failure'),
  }

  export class GetVillageName implements Action {
    type = Types.GET_VILLAGE_NAME;

    constructor(public payload: string) { }
  }

  export class GetVillageNameSuccess implements Action {
    type = Types.GET_VILLAGE_NAME_SUCCESS;

    constructor(public payload: string) { }
  }

  export class GetVillageNameFailure implements Action {
    type = Types.GET_VILLAGE_NAME_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetUserPoints implements Action {
    type = Types.GET_USER_POINTS;

    constructor(public payload: string) { }
  }

  export class GetUserPointsSuccess implements Action {
    type = Types.GET_USER_POINTS_SUCCESS;

    constructor(public payload: number) { }
  }

  export class GetUserPointsFailure implements Action {
    type = Types.GET_USER_POINTS_FAILURE;

    constructor(public payload: any) { }
  }

  export class CreateVillage implements Action {
    type = Types.CREATE_VILLAGE;

    constructor(public payload: any) { }
  }

  export class CreateVillageSuccess implements Action {
    type = Types.CREATE_VILLAGE_SUCCESS;
    payload;

    constructor() { }
  }

  export class CreateVillageFailure implements Action {
    type = Types.CREATE_VILLAGE_FAILURE;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetVillageName
    | GetVillageNameSuccess
    | GetVillageNameFailure
    | CreateVillage
    | CreateVillageSuccess
    | CreateVillageFailure
}
