import { initialWeb3State } from './web3.state';
import { Web3Actions } from './web3.actions';
import { Transaction } from './transaction.model';
import { Status, initialStatus } from '../shared/status.model';

export function web3Reducer (state = initialWeb3State, action: Web3Actions.Actions) {
  switch (action.type) {

    case Web3Actions.Types.BOOTSTRAP:
      return Object.assign({}, state, {status: new Status({ loading: true })});

    case Web3Actions.Types.BOOTSTRAP_SUCCESS:
      return Object.assign({}, state, {
        bootstraped: true,
        status:      new Status({ error: null })
      });

    case Web3Actions.Types.GET_BLOCK_NUMBER:
      return Object.assign({}, state, {
        status: new Status({ loading: true })
      })

    case Web3Actions.Types.GET_BLOCK_NUMBER_SUCCESS:
      return Object.assign({}, state, {
        lastBlock: action.payload,
        status:    new Status()
      });

    case Web3Actions.Types.GET_BLOCK_NUMBER_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload })
      });

    case Web3Actions.Types.GET_ACCOUNTS:
      return Object.assign({}, state, {
        status: new Status()
      })

    case Web3Actions.Types.GET_ACCOUNTS_SUCCESS:
      return Object.assign({}, state, {
        accounts: action.payload,
        status:   new Status()
      });

    case Web3Actions.Types.GET_ACCOUNTS_FAILURE:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload })
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
      return Object.assign({}, state, {
        bootstraped: false,
        status:      new Status({ error: action.payload.status.error })
      });

    case Web3Actions.Types.WEB3_SUCCESS:
      return Object.assign({}, state, {
        status: new Status({ error: action.payload })
      });

    default:
      return state;

  }
}
