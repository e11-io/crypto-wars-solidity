import { AssetsRequirementsActions } from './assets-requirements.actions';

export interface AssetsRequirementsState {
  requirements: any,
  loading: boolean
}

const initialAssetsRequirements: AssetsRequirementsState = {
  requirements: [],
  loading: false
};

export function assetsRequirements (state = initialAssetsRequirements, action: AssetsRequirementsActions.Actions) {
  switch (action.type) {

    case AssetsRequirementsActions.Types.GET_ASSETS_REQUIREMENTS:
      return Object.assign({}, state, {loading: true, error: null})

    case AssetsRequirementsActions.Types.GET_ASSETS_REQUIREMENTS_SUCCESS:
      let requirementsMap: any = {};
      action.payload.ids.forEach((id, i) => {
        requirementsMap[id] = action.payload.requirements[i].map(r => r.toNumber());
      })
      return Object.assign({}, state, {
        requirements: requirementsMap,
        loading: false
      })

    default:
      return state;
  }
}
