import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from "@angular/router";
import { Injectable } from "@angular/core";
import { Store } from '@ngrx/store';
import { Observable } from "rxjs/Observable";

import { CryptoWarsState } from "../../app.state";
import { environment } from '../../../environments/environment';

@Injectable()
export class BootstrapGuard implements CanActivate {

  private bootstraped$: Observable<boolean>;

  constructor(private store: Store<CryptoWarsState>) {
    this.bootstraped$ = this.store.select(s => s.web3.bootstraped);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve) => {
      if (environment.production) {
        resolve(false);
      }
      let sub = this.bootstraped$.subscribe((bootstraped) => {
        if (bootstraped) {
          if (sub && sub.unsubscribe) sub.unsubscribe();
          resolve(true);
        }
      })
    })
  }

}
