import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace BuildingsQueueActions {

  export const Types = {
    GET_BUILDINGS_QUEUE: type('[Buildings Queue] Get User Buildings Queue'),
    GET_BUILDINGS_QUEUE_SUCCESS: type('[Buildings Queue] Get User Buildings Queue Success'),
    GET_BUILDINGS_QUEUE_FAILURE: type('[Buildings Queue] Get User Buildings Queue Failure'),
    ADD_BUILDING_TO_QUEUE: type('[Buildings Queue] Add Building To Queue'),
    ADD_BUILDING_TO_QUEUE_SUCCESS: type('[Buildings Queue] Add Building To Queue Success'),
    ADD_BUILDING_TO_QUEUE_FAILURE: type('[Buildings Queue] Add Building To Queue Failure'),
    UPGRADE_BUILDING: type('[Buildings Queue] Upgrade Building'),
    UPGRADE_BUILDING_SUCCESS: type('[Buildings Queue] Upgrade Building Success'),
    UPGRADE_BUILDING_FAILURE: type('[Buildings Queue] Upgrade Building Failure'),
    CANCEL_BUILDING: type('[Buildings Queue] Cancel Building'),
    CANCEL_BUILDING_SUCCESS: type('[Buildings Queue] Cancel Building Success'),
    CANCEL_BUILDING_FAILURE: type('[Buildings Queue] Cancel Building Failure'),
  }

  export class GetBuildingsQueue implements Action {
    type = Types.GET_BUILDINGS_QUEUE;

    constructor(public payload: string) { }
  }

  export class GetBuildingsQueueSuccess implements Action {
    type = Types.GET_BUILDINGS_QUEUE_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetBuildingsQueueFailure implements Action {
    type = Types.GET_BUILDINGS_QUEUE_FAILURE;

    constructor(public payload: string) { }
  }

  export class AddBuildingToQueue implements Action {
    type = Types.ADD_BUILDING_TO_QUEUE;

    constructor(public payload: number) { }
  }

  export class AddBuildingToQueueSuccess implements Action {
    type = Types.ADD_BUILDING_TO_QUEUE_SUCCESS;

    constructor(public payload: any) { }
  }

  export class AddBuildingToQueueFailure implements Action {
    type = Types.ADD_BUILDING_TO_QUEUE_FAILURE;

    constructor(public payload: any, public error: string) { }
  }

  export class UpgradeBuilding implements Action {
    type = Types.UPGRADE_BUILDING;

    constructor(public payload: any) { }
  }

  export class UpgradeBuildingSuccess implements Action {
    type = Types.UPGRADE_BUILDING_SUCCESS;

    constructor(public payload: any) { }
  }

  export class UpgradeBuildingFailure implements Action {
    type = Types.UPGRADE_BUILDING_FAILURE;

    constructor(public payload: number, public error: string) { }
  }

  export class CancelBuilding implements Action {
    type = Types.CANCEL_BUILDING;

    constructor(public payload: any) { }
  }

  export class CancelBuildingSuccess implements Action {
    type = Types.CANCEL_BUILDING_SUCCESS;

    constructor(public payload: any) { }
  }

  export class CancelBuildingFailure implements Action {
    type = Types.CANCEL_BUILDING_SUCCESS;

    constructor(public payload: any) { }
  }

  export type Actions
    = GetBuildingsQueue
    | GetBuildingsQueueSuccess
    | GetBuildingsQueueFailure
    | AddBuildingToQueue
    | AddBuildingToQueueSuccess
    | AddBuildingToQueueFailure
    | UpgradeBuilding
    | UpgradeBuildingSuccess
    | UpgradeBuildingFailure
    | CancelBuilding
    | CancelBuildingSuccess
    | CancelBuildingFailure
}
