import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {Store} from '@ngrx/store';
import {CryptoWarsState} from "../../app.reducer";
import { environment } from '../../../environments/environment';


@Injectable()
export class BootstrapGuard implements CanActivate {

  private bootstraped$: Observable<boolean>;

  constructor(private store: Store<CryptoWarsState>) {
    this.bootstraped$ = this.store.select(s => s.web3State.bootstraped);
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
