import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Actions, Effect } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mergeMap';

import { Web3Actions } from '../core/web3/web3.actions';


@Injectable()
export class AppEffects {

  constructor(private actions$: Actions,
              public store: Store<any>) {
  }


}
