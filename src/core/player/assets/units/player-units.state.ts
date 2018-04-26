import { PlayerUnit } from './player-unit.model';
import { Status, initialStatus } from '../../../shared/status.model';

export interface PlayerUnitsState {
  list:   PlayerUnit[];
  status: Status;
}

export const initialPlayerUnitsState: PlayerUnitsState = {
  list:   [],
  status: initialStatus,
};
