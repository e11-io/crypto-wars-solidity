import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace AssetsUnitsDataActions {

  export const Types = {
    GET_UNITS_DATA:           type('[Units Data] Get Units Data'),
    GET_UNITS_DATA_SUCCESS:   type('[Units Data] Get Units Data Success'),
    GET_UNITS_DATA_FAILURE:   type('[Units Data] Get Units Data Failure'),
  }

  export class GetUnitsData implements Action {
    type = Types.GET_UNITS_DATA;
    payload: any;

    constructor() { }
  }

  export class GetUnitsDataSuccess implements Action {
    type = Types.GET_UNITS_DATA_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetUnitsDataFailure implements Action {
    type = Types.GET_UNITS_DATA_FAILURE;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetUnitsData
    | GetUnitsDataSuccess
    | GetUnitsDataFailure
}
