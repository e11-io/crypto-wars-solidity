import { QueueBuilding } from './queue-building.model';
import { Status, initialStatus } from '../../../shared/status.model';

export interface AssetsBuildingsQueueState {
  list:      QueueBuilding[],
  localList: QueueBuilding[],
  status:    Status,
}

export const initialAssetsBuildingsQueueState: AssetsBuildingsQueueState = {
  list:      [],
  localList: [],
  status:    initialStatus,
};
