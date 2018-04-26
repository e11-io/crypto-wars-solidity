import { DataBuilding } from './data-building.model';
import { Status, initialStatus } from '../../../shared/status.model';

export interface DataBuildingMap {
  [buildingId: string]: DataBuilding;
};

export interface AssetsBuildingsDataState {
  listMap: DataBuildingMap,
  status:  Status,
};

export const initialAssetsBuildingsDataState: AssetsBuildingsDataState = {
  listMap: {},
  status:  initialStatus,
};
