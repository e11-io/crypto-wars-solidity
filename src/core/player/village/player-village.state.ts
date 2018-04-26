import { Status, initialStatus } from '../../shared/status.model';

export interface PlayerVillageState {
  villageName: string;
  status: Status;
}

export const initialPlayerVillageState: PlayerVillageState = {
  villageName: '',
  status: initialStatus,
};
