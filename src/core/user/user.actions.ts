import { Action } from '@ngrx/store';
import { type } from '../../app/shared/util/type';

export namespace UserActions {

  export const Types = {
    GET_BALANCES: type('[User] Get Balances'),
    GET_ETH_BALANCE: type('[User] Get Eth Balance'),
    GET_ETH_BALANCE_SUCCESS: type('[User] Get Eth Balance Success'),
    GET_ETH_BALANCE_FAILURE: type('[User] Get Eth Balance Failure'),
    GET_E11_BALANCE: type('[User] Get e11 Balance'),
    GET_E11_BALANCE_SUCCESS: type('[User] Get e11 Balance Success'),
    GET_E11_BALANCE_FAILURE: type('[User] Get e11 Balance Failure'),
  }

  export class GetBalances implements Action {
    type = Types.GET_BALANCES;
    payload;

    constructor() { }
  }

  export class GetEthBalance implements Action {
    type = Types.GET_ETH_BALANCE;

    constructor(public payload: string) { }
  }

  export class GetEthBalanceSuccess implements Action {
    type = Types.GET_ETH_BALANCE_SUCCESS;

    constructor(public payload: number) { }
  }

  export class GetEthBalanceFailure implements Action {
    type = Types.GET_ETH_BALANCE_FAILURE;

    constructor(public payload: any) { }
  }

  export class GetE11Balance implements Action {
    type = Types.GET_E11_BALANCE

    constructor(public payload: string) { }
  }

  export class GetE11BalanceSuccess implements Action {
    type = Types.GET_E11_BALANCE_SUCCESS

    constructor(public payload: number) { }
  }

  export class GetE11BalanceFailure implements Action {
    type = Types.GET_E11_BALANCE_FAILURE

    constructor(public payload: any) { }
  }

  export type Actions
    = GetBalances
    | GetEthBalance
    | GetEthBalanceSuccess
    | GetEthBalanceFailure
    | GetE11Balance
    | GetE11BalanceSuccess
    | GetE11BalanceFailure
}
