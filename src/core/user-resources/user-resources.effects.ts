import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { ContractsService } from '../../app/shared/services/contracts.service';
import { UserResourcesActions } from './user-resources.actions';
import { Web3Actions } from '../web3/web3.actions';
import { Web3Service } from '../../app/shared/services/web3.service';


@Injectable()
export class UserResourcesEffects {

  constructor(private actions$: Actions,
              public store: Store<any>,
              private web3Service: Web3Service,
              private contractsService: ContractsService) {
  }

  @Effect({dispatch: false}) getUserResources$ = this.actions$
    .ofType(UserResourcesActions.Types.GET_USER_RESOURCES)
    .do((action: UserResourcesActions.GetUserResources) => {
      let activeAccount: string;
      this.store.select('web3State').take(1).subscribe(web3 => {
        activeAccount = web3.activeAccount;
      });
      this.web3Service.callContract(
        this.contractsService.UserResourcesInstance.getUserResources,
        [activeAccount]
      ).then((resources: any) => {
        if (resources.error) {
          return this.store.dispatch(new UserResourcesActions.GetUserResourcesFailure(resources.error));
        }
        this.web3Service.callContract(
          this.contractsService.UserResourcesInstance.calculateUserResources,
          [activeAccount]
        ).then((unclaimedResources: any) => {
          if (unclaimedResources.error) {
            return this.store.dispatch(new UserResourcesActions.GetUserResourcesFailure(resources.error));
          }

          let goldCapacity: number = 0;
          let crystalCapacity: number = 0;
          this.store.select('userResourcesState').take(1).subscribe(userResources => {
            goldCapacity = userResources.goldCapacity;
            crystalCapacity = userResources.crystalCapacity;
          });

          let gold = resources[0].toNumber() + unclaimedResources[0].toNumber();
          let crystal = resources[1].toNumber() + unclaimedResources[1].toNumber();
          let quantum = resources[2].toNumber();

          gold = gold > goldCapacity ? goldCapacity : gold;
          crystal = crystal > crystalCapacity ? crystalCapacity : crystal;

          return this.store.dispatch(new UserResourcesActions.GetUserResourcesSuccess(
            [gold, crystal, quantum]
          ));
        })
      });
    });

  @Effect({dispatch: false}) giveResourcesToUser$ = this.actions$
    .ofType(UserResourcesActions.Types.GIVE_RESOURCES_TO_USER)
    .mergeMap((action: UserResourcesActions.GiveResourcesToUser) =>
      this.web3Service.sendContractTransaction(
        this.contractsService.UserResourcesInstance.giveResourcesToUser,
        [action.payload, 200, 0, 0, {from: action.payload}]
      )
    )


}
