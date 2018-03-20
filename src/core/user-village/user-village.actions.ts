import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace UserVillageActions {

  export const Types = {
    GET_VILLAGE_NAME: type('[User Village] Get Village Name'),
    GET_VILLAGE_NAME_SUCCESS: type('[User Village] Get Village Name Success'),
    GET_VILLAGE_NAME_FAILURE: type('[User Village] Get Village Name Failure'),
    CREATE_VILLAGE: type('[User Village] Create Village'),
    CREATE_VILLAGE_SUCCESS: type('[User Village] Create Village Success'),
    CREATE_VILLAGE_FAILURE: type('[User Village] Create Village Failure'),
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
