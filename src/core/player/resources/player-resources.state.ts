import { Status, initialStatus } from '../../shared/status.model';

export interface PlayerResourcesRates {
  gold:    number;
  crystal: number;
};

export interface PlayerResourcesState {
  crystal:         number;
  crystalCapacity: number;
  gold:            number;
  goldCapacity:    number;
  quantum:         number;
  rates:           PlayerResourcesRates;
  status:          Status;
};

export const initialPlayerResourcesState: PlayerResourcesState = {
  crystal:         0,
  crystalCapacity: 0,
  gold:            0,
  goldCapacity:    0,
  quantum:         0,
  rates: {
    gold:    0,
    crystal: 0,
  },
  status:          initialStatus,
};
