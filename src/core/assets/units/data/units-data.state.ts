import { DataUnit } from './data-unit.model';
import { Status, initialStatus } from '../../../shared/status.model';

export interface DataUnitMap {
  [unitId: string]: DataUnit;
}
export interface AssetsUnitsDataState {
  listMap: DataUnitMap,
  status:  Status,
}

export const initialAssetsUnitsDataState: AssetsUnitsDataState = {
  listMap: {},
  status:  initialStatus,
};
