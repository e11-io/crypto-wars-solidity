import { Status, initialStatus } from '../../shared/status.model';

export interface PlayerVillageState {
  villageName: string;
  points:      number;
  status:      Status;
}

export const initialPlayerVillageState: PlayerVillageState = {
  villageName: '',
  points:      0,
  status:      initialStatus,
};
