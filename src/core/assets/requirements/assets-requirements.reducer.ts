import { AssetsRequirementsActions } from './assets-requirements.actions';
import { DataRequirementMap, initialAssetsRequirementsState } from './assets-requirements.state';
import { Status } from '../../shared/status.model';


export function assetsRequirementsReducer (state = initialAssetsRequirementsState, action: AssetsRequirementsActions.Actions) {
  switch (action.type) {

    case AssetsRequirementsActions.Types.GET_REQUIREMENTS:
      return Object.assign({}, state, {
        status: new Status({ loading: true })
      })

    case AssetsRequirementsActions.Types.GET_REQUIREMENTS_SUCCESS:
      let requirementsMap: DataRequirementMap = Object.assign({}, state.listMap);
      action.payload.ids.forEach((id, i) => {
        requirementsMap[id] = action.payload.requirements[i].map(r => r.toNumber());
      })
      return Object.assign({}, state, {
        listMap: requirementsMap,
        status:  new Status({loading: false})
      })

    default:
      return state;
  }
}
