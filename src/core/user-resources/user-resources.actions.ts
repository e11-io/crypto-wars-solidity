import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace UserResourcesActions {

  export const Types = {
    GET_USER_RESOURCES: type('[User Resources] Get User Resources'),
    GET_USER_RESOURCES_SUCCESS: type('[User Resources] Get User Resources Success'),
    GET_USER_RESOURCES_FAILURE: type('[User Resources] Get User Resources Failure'),
    GIVE_RESOURCES_TO_USER: type('[web3] Give Resources To User'),
    SET_RATES_AND_CAPACITY: type('[User Resources] Set Resources Rates and Capacity')
  }

  export class GetUserResources implements Action {
    type = Types.GET_USER_RESOURCES;
    payload;

    constructor() { }
  }

  export class GetUserResourcesSuccess implements Action {
    type = Types.GET_USER_RESOURCES_SUCCESS;

    constructor(public payload: any[]) { }
  }

  export class GetUserResourcesFailure implements Action {
    type = Types.GET_USER_RESOURCES_FAILURE;

    constructor(public payload: any) { }
  }

  export class GiveResourcesToUser implements Action {
    type = Types.GIVE_RESOURCES_TO_USER;

    constructor(public payload: string) { }
  }

  export class SetRatesAndCapacty implements Action {
    type = Types.SET_RATES_AND_CAPACITY;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetUserResources
    | GetUserResourcesSuccess
    | GetUserResourcesFailure
    | GiveResourcesToUser
    | SetRatesAndCapacty
}
