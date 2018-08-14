import { Status, initialStatus } from '../../shared/status.model';
import { PlayerTarget } from './player-target.model';

export interface PlayerTargetsState {
  expandedTarget:   PlayerTarget;
  oldestBlock:      number;
  currentBlock:     number;
  targets:          PlayerTarget[];
  status:           Status;
  searchThreshold:  number;
  limitThreshold:   number;
  targetsNonce:     number;
}

export const initialPlayerTargetsState: PlayerTargetsState = {
  expandedTarget:         null,
  oldestBlock:            null,
  currentBlock:           null,
  targets:                [],
  status:                 initialStatus,
  searchThreshold:        10000,
  limitThreshold:         50000,
  targetsNonce:           0,
};
