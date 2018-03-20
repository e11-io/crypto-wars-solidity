import { Web3Actions } from './web3.actions';
import { Transaction } from './transaction.model';

export interface Web3State {
  accounts: string[],
  activeAccount: string,
  bootstraped: boolean,
  error: string,
  lastBlock: number,
  loop: boolean,
  loading: boolean,
  transactions: Transaction[],
}

const initialWeb3State: Web3State = {
  accounts: [],
  activeAccount: null,
  bootstraped: false,
  error: null,
  lastBlock: 0,
  loop: false,
  loading: false,
  transactions: [],
}

export function web3 (state = initialWeb3State, action: Web3Actions.Actions) {
  switch (action.type) {

    case Web3Actions.Types.BOOTSTRAP:
      return Object.assign({}, state, {loading: true});

    case Web3Actions.Types.BOOTSTRAP_SUCCESS:
      return Object.assign({}, state, {loading: false, bootstraped: true, error: null});

    case Web3Actions.Types.GET_BLOCK_NUMBER:
      return Object.assign({}, state, {loading: true})

    case Web3Actions.Types.GET_BLOCK_NUMBER_SUCCESS:
      return Object.assign({}, state, {
        lastBlock: action.payload,
        loading: false
      });

    case Web3Actions.Types.GET_BLOCK_NUMBER_FAILURE:
      return Object.assign({}, state, {
        error: action.payload,
        loading: false
      });

    case Web3Actions.Types.GET_ACCOUNTS:
      return Object.assign({}, state, {loading: true})

    case Web3Actions.Types.GET_ACCOUNTS_SUCCESS:
      return Object.assign({}, state, {
        accounts: action.payload,
        loading: false
      });

    case Web3Actions.Types.GET_ACCOUNTS_FAILURE:
      return Object.assign({}, state, {
        error: action.payload,
        loading: false
      });

    case Web3Actions.Types.START_PULL:
      return Object.assign({}, state, {
        loop: true
      });

    case Web3Actions.Types.STOP_PULL:
      return Object.assign({}, state, {
        loop: false
      });

    case Web3Actions.Types.SET_ACTIVE_ACCOUNT:
      return Object.assign({}, state, {
        activeAccount: action.payload
      });

    case Web3Actions.Types.TRANSACTION_SUBSCRIBE:
      return Object.assign({}, state, {transactions: state.transactions.concat([action.payload])});

    case Web3Actions.Types.TRANSACTION_UNSUBSCRIBE:
      return Object.assign({}, state, {transactions: state.transactions.filter(tx => tx.hash != action.payload.hash)});

    case Web3Actions.Types.WEB3_ERROR:
      return Object.assign({}, state, {loading: false, error: action.payload, bootstraped: false});

    case Web3Actions.Types.WEB3_SUCCESS:
      return Object.assign({}, state, {loading: false, error: null});

    default:
      return state;

  }
}
