import { Action } from '@ngrx/store';
import { type } from '../core/shared/util/type';

export namespace AppActions {

  export const Types = {
    SET_BUILDINGS: type('[App] Set Buildings'),
    SET_UNITS:     type('[App] Set Units'),
  }

  export class SetBuildings implements Action {
    type = Types.SET_BUILDINGS;

    constructor(public payload: any) { }
  }


  export class SetUnits implements Action {
    type = Types.SET_UNITS;

    constructor(public payload: any) { }
  }


  export type Actions
    = SetBuildings
    | SetUnits
}
