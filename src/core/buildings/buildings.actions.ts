import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace BuildingsActions {

  export const Types = {
    SET_BUILDINGS: type('[Buildings] Set Building'),
  }

  export class SetBuildings implements Action {
    type = Types.SET_BUILDINGS;

    constructor(public payload: any) { }
  }


  export type Actions
    = SetBuildings
}
