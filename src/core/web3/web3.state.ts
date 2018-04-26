import { Transaction } from './transaction.model';
import { Status, initialStatus } from '../shared/status.model';

export interface Web3State {
  accounts:      string[];
  activeAccount: string;
  bootstraped:   boolean;
  lastBlock:     number;
  loop:          boolean;
  transactions:  Transaction[];
  status:        Status;
}

export const initialWeb3State: Web3State = {
  accounts:      [],
  activeAccount: null,
  bootstraped:   false,
  lastBlock:     0,
  loop:          false,
  transactions:  [],
  status:        initialStatus,
}
