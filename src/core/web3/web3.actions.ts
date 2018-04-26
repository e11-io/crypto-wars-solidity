import { Action } from '@ngrx/store';
import { type } from '../shared/util/type';

export namespace Web3Actions {

  export const Types = {
    BOOTSTRAP:                type('[web3] Bootstrap'),
    BOOTSTRAP_SUCCESS:        type('[web] Bootstrap Success'),
    BOOTSTRAP_RETRY:          type('[web] Bootstrap Failure'),
    GET_ACCOUNTS:             type('[web3] Get Accounts'),
    GET_ACCOUNTS_SUCCESS:     type('[web3] Get Accounts Success'),
    GET_ACCOUNTS_FAILURE:     type('[web3] Get Accounts Failure'),
    GET_BLOCK_NUMBER:         type('[web3] Get Block Number'),
    GET_BLOCK_NUMBER_SUCCESS: type('[web3] Get Block Number Success'),
    GET_BLOCK_NUMBER_FAILURE: type('[web3] Get Block Number Failure'),
    PROCCESS_PULL:            type('[web3] Proccess Pull'),
    SET_ACTIVE_ACCOUNT:       type('[web3] Set Active Acount'),
    START_PULL:               type('[web3] Start Pull'),
    STOP_PULL:                type('[web3] Stop Pull'),
    TRANSACTION_SUBSCRIBE:    type('[web3] Transaction Subscribe'),
    TRANSACTION_LOOKUP:       type('[web3] Transaction Lookup'),
    TRANSACTION_UNSUBSCRIBE:  type('[web3] Transaction Unsubscribe'),
    WEB3_CHECK:               type('[web] Web3 Check'),
    WEB3_ERROR:               type('[web3] Web3 Error'),
    WEB3_SUCCESS:             type('[web3] Web3 Success'),
  }

  export class Bootstrap implements Action {
    type = Types.BOOTSTRAP;
    payload;

    constructor() { }
  }

  export class BootstrapSuccess implements Action {
    type = Types.BOOTSTRAP_SUCCESS;
    payload;

    constructor() { }
  }

  export class BootstrapRetry implements Action {
    type = Types.BOOTSTRAP_RETRY;
    payload;

    constructor() { }
  }


  export class GetBlockNumber implements Action {
    type = Types.GET_BLOCK_NUMBER;
    payload;

    constructor() { }
  }

  export class GetBlockNumberSuccess implements Action {
    type = Types.GET_BLOCK_NUMBER_SUCCESS

    constructor(public payload: any) { }
  }

  export class GetBlockNumberFailure implements Action {
    type = Types.GET_BLOCK_NUMBER_FAILURE

    constructor(public payload: any) { }
  }

  export class GetAccounts implements Action {
    type = Types.GET_ACCOUNTS;
    payload;

    constructor() { }
  }

  export class GetAccountsSucccess implements Action {
    type = Types.GET_ACCOUNTS_SUCCESS;

    constructor(public payload: any) { }
  }

  export class GetAccountsFailure implements Action {
    type = Types.GET_ACCOUNTS_FAILURE;

    constructor(public payload: any) { }
  }

  export class ProccessPull implements Action {
    type = Types.PROCCESS_PULL;
    payload;

    constructor() { }
  }

  export class StartPull implements Action {
    type = Types.START_PULL;
    payload;

    constructor() { }
  }

  export class StopPull implements Action {
    type = Types.STOP_PULL;
    payload;

    constructor() { }
  }

  export class SetActiveAccount implements Action {
    type = Types.SET_ACTIVE_ACCOUNT;

    constructor(public payload: any) { }
  }
  export class TransactionSubscribe implements Action {
    type = Types.TRANSACTION_SUBSCRIBE;

    constructor(public payload: any) { }
  }
  export class TransactionLookup implements Action {
    type = Types.TRANSACTION_LOOKUP;
    payload;

    constructor() { }
  }
  export class TransactionUnsubscribe implements Action {
    type = Types.TRANSACTION_UNSUBSCRIBE;

    constructor(public payload: any) { }
  }

  export class Web3Check implements Action {
    type = Types.WEB3_CHECK;
    payload;

    constructor() { }
  }

  export class Web3Success implements Action {
    type = Types.WEB3_SUCCESS;
    payload;

    constructor() { }
  }

  export class Web3Error implements Action {
    type = Types.WEB3_ERROR;

    constructor(public payload: any) { }
  }

  export type Actions
    = Bootstrap
    | BootstrapSuccess
    | BootstrapRetry
    | GetAccounts
    | GetAccountsSucccess
    | GetAccountsFailure
    | GetBlockNumber
    | GetBlockNumberSuccess
    | GetBlockNumberFailure
    | ProccessPull
    | StartPull
    | StopPull
    | SetActiveAccount
    | TransactionSubscribe
    | TransactionLookup
    | TransactionUnsubscribe
    | Web3Check
    | Web3Error
    | Web3Success;

}
