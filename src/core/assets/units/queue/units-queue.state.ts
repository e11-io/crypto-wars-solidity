import { QueueUnit } from './queue-unit.model';
import { Status, initialStatus } from '../../../shared/status.model';

export interface AssetsUnitsQueueState {
  list:      QueueUnit[],
  localList: QueueUnit[],
  status:    Status,
}

export const initialAssetsUnitsQueueState: AssetsUnitsQueueState = {
  list:      [],
  localList: [],
  status:    initialStatus,
};
