import { OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { CryptoWarsState } from '../../app.reducer';


export abstract class AbstractContainerComponent implements OnDestroy {

  private subs: Subscription[] = [];

  activeAccount: string = '';

  constructor(protected store: Store<CryptoWarsState>) {
    this.addToSubscriptions(
      this.setActiveAccount()
    );
  }

  setActiveAccount() {
    return this.store.select('web3State').subscribe(web3 => {
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
