import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace AssetsBuildingsDataActions {

  export const Types = {
    GET_BUILDINGS_DATA:           type('[Buildings Data] Get Buildings Data'),
    GET_BUILDINGS_DATA_SUCCESS:   type('[Buildings Data] Get Buildings Data Success'),
    GET_BUILDINGS_DATA_FAILURE:   type('[Buildings Data] Get Buildings Data Failure'),
  }

  export class GetBuildingsData implements Action {
    type = Types.GET_BUILDINGS_DATA;
    payload;

    constructor() { }
  }

  export class GetBuildingsDataSuccess implements Action {
    type = Types.GET_BUILDINGS_DATA_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetBuildingsDataFailure implements Action {
    type = Types.GET_BUILDINGS_DATA_FAILURE;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetBuildingsData
    | GetBuildingsDataSuccess
    | GetBuildingsDataFailure
}
