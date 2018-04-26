import { Action } from '@ngrx/store';
import { type } from '../../../shared/util/type';

export namespace AssetsUnitsQueueActions {

  export const Types = {
    GET_UNITS_QUEUE:           type('[Units Queue] Get User Units Queue'),
    GET_UNITS_QUEUE_SUCCESS:   type('[Units Queue] Get User Units Queue Success'),
    GET_UNITS_QUEUE_FAILURE:   type('[Units Queue] Get User Units Queue Failure'),
    ADD_UNIT_TO_QUEUE:         type('[Units Queue] Add Unit To Queue'),
    ADD_UNIT_TO_QUEUE_SUCCESS: type('[Units Queue] Add Unit To Queue Success'),
    ADD_UNIT_TO_QUEUE_FAILURE: type('[Units Queue] Add Unit To Queue Failure'),
  }

  export class GetUnitsQueue implements Action {
    type = Types.GET_UNITS_QUEUE;

    constructor(public payload: string) { }
  }

  export class GetUnitsQueueSuccess implements Action {
    type = Types.GET_UNITS_QUEUE_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetUnitsQueueFailure implements Action {
    type = Types.GET_UNITS_QUEUE_FAILURE;

    constructor(public payload: any) { }
  }

  export class AddUnitToQueue implements Action {
    type = Types.ADD_UNIT_TO_QUEUE;

    constructor(public payload: any) { }
  }

  export class AddUnitToQueueSuccess implements Action {
    type = Types.ADD_UNIT_TO_QUEUE_SUCCESS;

    constructor(public payload: any) { }
  }

  export class AddUnitToQueueFailure implements Action {
    type = Types.ADD_UNIT_TO_QUEUE_FAILURE;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetUnitsQueue
    | GetUnitsQueueSuccess
    | GetUnitsQueueFailure
    | AddUnitToQueue
    | AddUnitToQueueSuccess
    | AddUnitToQueueFailure

}
