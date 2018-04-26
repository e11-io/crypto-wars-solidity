import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

@Component({
  selector: 'e11-assets',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss']
})

export class TradesComponent {

  constructor(private store: Store<any>) {

  }

}
