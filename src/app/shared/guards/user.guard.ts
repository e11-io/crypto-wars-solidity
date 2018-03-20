import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs/Observable";
import { CryptoWarsState } from "../../app.reducer";
import { ContractsService } from "../services/contracts.service";
import { Web3Service } from "../services/web3.service";

@Injectable()
export class UserGuard implements CanActivate {

  private bootstraped$: Observable<boolean>;
  private errors: string[] = [];
  private path: string = '';
  private params: any = {};

  constructor(private store: Store<CryptoWarsState>,
              private contracts: ContractsService,
              private web3Service: Web3Service,
              private router: Router) {
    this.bootstraped$ = this.store.select(s => s.web3State.bootstraped);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    this.path = next.routeConfig.path;
    if (state.root && state.root.firstChild && state.root.firstChild.params) {
      this.params = state.root.firstChild.params;
    }
    return new Promise((resolve) => {
      let sub = this.bootstraped$.subscribe((bootstraped) => {
        if (bootstraped) {
          if (sub && sub.unsubscribe) sub.unsubscribe();
          this.checkUserRequirements(resolve);
        }
      })
    })
  }

  checkUserRequirements(resolve: any) {
    let activeAccount;
    this.web3Service.getAccounts().then((accounts) => {
      activeAccount = accounts[0];
      this.checkVillage(resolve, activeAccount);
    });
  }

  checkVillage(resolve: any, activeAccount) {
    this.web3Service.callContract(
      this.contracts.UserVillageInstance.villages,
      [ activeAccount, {from: activeAccount} ]
    ).then((result) => {
      if (result && !result.error) return this.finish(resolve);
      this.errors.push('village');
      this.checkE11Balance(resolve, activeAccount);
    })
  }

  checkE11Balance(resolve: any, activeAccount) {
    this.web3Service.callContract(
      this.contracts.ExperimentalTokenInstance.balanceOf,
      [ activeAccount, {from: activeAccount} ]
    ).then((result) => {
      if (result && !result.error && result.toNumber() > 0) return this.finish(resolve);
      this.errors.push('e11-balance');
      this.checkEthBalance(resolve, activeAccount);
    })
  }

  checkEthBalance(resolve: any, activeAccount) {
    this.web3Service.getEthBalance(activeAccount).then((result) => {
      if (result > 0) return this.finish(resolve);
      this.errors.push('eth-balance');
      // Last check finishes
      this.finish(resolve);
    });
  }

  finish(resolve) {
    let hasErrors = this.errors.length > 0;
    if (this.path === 'onboarding') {
      if (hasErrors) {
        let lastError = this.errors[this.errors.length - 1];
        // We expect errors on onboarding but we check if it's different
        if (lastError == this.params.missing) {
          resolve(true);
        } else {
          this.router.navigate(['/onboarding', { missing: lastError }]);
          resolve(false);
        }
      } else {
        // If there are no erros we redirect to the main-page
        this.router.navigate(['/']);
        resolve(false);
      }
    } else {
      if (hasErrors) {
        // If we have erros we should redirect to onboarding
        let lastError = this.errors[this.errors.length - 1];
        this.router.navigate(['/onboarding', { missing: lastError }]);
        resolve(false);
      } else {
        // Else we continue to the route
        resolve(true);
      }
    }
  }

}
