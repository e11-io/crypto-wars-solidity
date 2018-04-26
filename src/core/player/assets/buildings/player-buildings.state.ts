import { PlayerBuilding } from './player-building.model';
import { Status, initialStatus } from '../../../shared/status.model';

export interface PlayerBuildingsState {
  list:   PlayerBuilding[];
  status: Status;
}

export const initialPlayerBuildingsState: PlayerBuildingsState = {
  list:   [],
  status: initialStatus,
};
