import { Action } from '@ngrx/store';
import { type } from '../../shared/util/type';

export namespace AssetsRequirementsActions {

  export const Types = {
    GET_REQUIREMENTS:         type('[Requirements] Get Requirements'),
    GET_REQUIREMENTS_SUCCESS: type('[Requirements] Get Requirements Success'),
    GET_REQUIREMENTS_FAILURE: type('[Requirements] Get Requirements Failure'),
  }

  export class GetRequirements implements Action {
    type = Types.GET_REQUIREMENTS;

    constructor(public payload: any) { }
  }

  export class GetRequirementsSuccess implements Action {
    type = Types.GET_REQUIREMENTS_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetRequirementsFailure implements Action {
    type = Types.GET_REQUIREMENTS_FAILURE;

    constructor(public payload: any) { }
  }


  export type Actions
    = GetRequirements
    | GetRequirementsSuccess
    | GetRequirementsFailure
}
