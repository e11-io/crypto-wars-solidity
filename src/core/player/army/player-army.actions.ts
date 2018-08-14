import { Action } from '@ngrx/store';
import { type } from '../../shared/util/type';

export namespace PlayerArmyActions {

  export const Types = {
    SET_ARMY:         type('[Player Army] Set Army'),
  }

  export class SetArmy implements Action {
    type = Types.SET_ARMY;

    constructor(public payload: any) { }
  }

  export type Actions
    = SetArmy
}
