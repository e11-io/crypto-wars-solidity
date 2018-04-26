import { Status, initialStatus } from '../../shared/status.model';

export interface PlayerTokensState {
  ethBalance: number;
  e11Balance: number;
  status:     Status;
}

export const initialPlayerTokensState: PlayerTokensState = {
  ethBalance: 0,
  e11Balance: 0,
  status:     initialStatus,
};
