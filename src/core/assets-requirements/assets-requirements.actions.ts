import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace AssetsRequirementsActions {

  export const Types = {
    GET_ASSETS_REQUIREMENTS: type('[Assets Requirements] Get Assets Requirements'),
    GET_ASSETS_REQUIREMENTS_SUCCESS: type('[Assets Requirements] Get Assets Requirements Success'),
    GET_ASSETS_REQUIREMENTS_FAILURE: type('[Assets Requirements] Get Assets Requirements Failure'),
  }

  export class GetAssetsRequirements implements Action {
    type = Types.GET_ASSETS_REQUIREMENTS;

    constructor(public payload: any) { }
  }

  export class GetAssetsRequirementsSuccess implements Action {
    type = Types.GET_ASSETS_REQUIREMENTS_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetAssetsRequirementsFailure implements Action {
    type = Types.GET_ASSETS_REQUIREMENTS_FAILURE;

    constructor(public payload: any) { }
  }


  export type Actions
    = GetAssetsRequirements
    | GetAssetsRequirementsSuccess
    | GetAssetsRequirementsFailure
}
