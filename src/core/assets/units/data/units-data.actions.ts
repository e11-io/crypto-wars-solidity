import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace AssetsUnitsDataActions {

  export const Types = {
    GET_UNITS_IDS:            type('[Units Data] Get Units Ids'),
    GET_UNITS_IDS_SUCCESS:    type('[Units Data] Get Units Ids Success'),
    GET_UNITS_IDS_FAILURE:    type('[Units Data] Get Units Ids Failure'),
    GET_UNITS_DATA:           type('[Units Data] Get Units Data'),
    GET_UNITS_DATA_SUCCESS:   type('[Units Data] Get Units Data Success'),
    GET_UNITS_DATA_FAILURE:   type('[Units Data] Get Units Data Failure'),
    GET_UNITS_LENGTH:         type('[Units Data] Get Units Length'),
    GET_UNITS_LENGTH_SUCCESS: type('[Units Data] Get Units Length Success'),
    GET_UNITS_LENGTH_FAILURE: type('[Units Data] Get Units Length Failure')
  }

  export class GetUnitsIds implements Action {
    type = Types.GET_UNITS_IDS;

    constructor(public payload: any) { }
  }

  export class GetUnitsIdsSuccess implements Action {
    type = Types.GET_UNITS_IDS_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetUnitsIdsFailure implements Action {
    type = Types.GET_UNITS_IDS_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetUnitsData implements Action {
    type = Types.GET_UNITS_DATA;

    constructor(public payload: any[]) { }
  }

  export class GetUnitsDataSuccess implements Action {
    type = Types.GET_UNITS_DATA_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetUnitsDataFailure implements Action {
    type = Types.GET_UNITS_DATA_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetUnitsLength implements Action {
    type = Types.GET_UNITS_LENGTH;
    payload;

    constructor() { }
  }

  export class GetUnitsLengthSuccess implements Action {
    type = Types.GET_UNITS_LENGTH_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetUnitsLengthFailure implements Action {
    type = Types.GET_UNITS_LENGTH_FAILURE;

    constructor(public payload: any) { }
  }


  export type Actions
    = GetUnitsIds
    | GetUnitsIdsSuccess
    | GetUnitsIdsFailure
    | GetUnitsData
    | GetUnitsDataSuccess
    | GetUnitsDataFailure
    | GetUnitsLength
    | GetUnitsLengthSuccess
    | GetUnitsLengthFailure
}
