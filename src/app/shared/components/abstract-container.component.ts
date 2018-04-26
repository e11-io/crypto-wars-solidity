import { OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { CryptoWarsState, AppState } from '../../app.state';

export abstract class AbstractContainerComponent implements OnDestroy {

  private subs: Subscription[] = [];

  app$: Observable<AppState>;
  activeAccount: string = '';

  constructor(protected store: Store<CryptoWarsState>) {
    this.app$ = this.store.select(s => s.app).filter(app => app.initialized);
    this.addToSubscriptions(
      this.setActiveAccount()
    );
  }

  setActiveAccount() {
    return this.store.select('web3').subscribe(web3 => {
      this.activeAccount = web3.activeAccount;
    })
  }

  protected addToSubscriptions(...subs) {
    subs.forEach(sub => {
      if (!(sub instanceof Subscription)) {
        console.log(sub);
        throw new Error('Invalid subscription, object should be of type Subscription');
      }
      this.subs.push(sub);
    });
  }

  ngOnDestroy() {
    this.subs.forEach(sub => {
      sub.unsubscribe();
    });
  }

}
