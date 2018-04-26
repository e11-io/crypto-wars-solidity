import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace AssetsBuildingsDataActions {

  export const Types = {
    GET_BUILDINGS_IDS:            type('[Buildings Data] Get Buildings Ids'),
    GET_BUILDINGS_IDS_SUCCESS:    type('[Buildings Data] Get Buildings Ids Success'),
    GET_BUILDINGS_IDS_FAILURE:    type('[Buildings Data] Get Buildings Ids Failure'),
    GET_BUILDINGS_DATA:           type('[Buildings Data] Get Buildings Data'),
    GET_BUILDINGS_DATA_SUCCESS:   type('[Buildings Data] Get Buildings Data Success'),
    GET_BUILDINGS_DATA_FAILURE:   type('[Buildings Data] Get Buildings Data Failure'),
    GET_BUILDINGS_LENGTH:         type('[Buildings Data] Get Buildings Length'),
    GET_BUILDINGS_LENGTH_SUCCESS: type('[Buildings Data] Get Buildings Length Success'),
    GET_BUILDINGS_LENGTH_FAILURE: type('[Buildings Data] Get Buildings Length Failure')
  }

  export class GetBuildingsIds implements Action {
    type = Types.GET_BUILDINGS_IDS;

    constructor(public payload: any) { }
  }

  export class GetBuildingsIdsSuccess implements Action {
    type = Types.GET_BUILDINGS_IDS_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetBuildingsIdsFailure implements Action {
    type = Types.GET_BUILDINGS_IDS_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetBuildingsData implements Action {
    type = Types.GET_BUILDINGS_DATA;

    constructor(public payload: any[]) { }
  }

  export class GetBuildingsDataSuccess implements Action {
    type = Types.GET_BUILDINGS_DATA_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetBuildingsDataFailure implements Action {
    type = Types.GET_BUILDINGS_DATA_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetBuildingsLength implements Action {
    type = Types.GET_BUILDINGS_LENGTH;
    payload;

    constructor() { }
  }

  export class GetBuildingsLengthSuccess implements Action {
    type = Types.GET_BUILDINGS_LENGTH_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetBuildingsLengthFailure implements Action {
    type = Types.GET_BUILDINGS_LENGTH_FAILURE;

    constructor(public payload: any) { }
  }


  export type Actions
    = GetBuildingsIds
    | GetBuildingsIdsSuccess
    | GetBuildingsIdsFailure
    | GetBuildingsData
    | GetBuildingsDataSuccess
    | GetBuildingsDataFailure
    | GetBuildingsLength
    | GetBuildingsLengthSuccess
    | GetBuildingsLengthFailure
}
