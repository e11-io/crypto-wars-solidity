import { Status, initialStatus } from '../../shared/status.model';

export interface DataRequirementMap {
  [assetId: number]: number[];
}

export interface AssetsRequirementsState {
  listMap: DataRequirementMap,
  status:  Status,
}

export const initialAssetsRequirementsState: AssetsRequirementsState = {
  listMap: {},
  status:  initialStatus,
};
