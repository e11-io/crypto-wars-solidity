import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';


import { CryptoWarsState } from '../../app.state';

import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';

import { Unit, /*UnitMap,*/ UnitQuantitytMap } from '../../shared/models/unit.model';


@Component({
  selector: 'e11-battle-army-stats',
  templateUrl: './army-stats.component.html',
  styleUrls: ['./army-stats.component.scss']
})

export class BattleArmyStatsComponent extends AbstractContainerComponent {
  units: Unit[] = [];
  armyStats: any = {
    hp: 0,
    attack: 0,
    defense: 0,
  };


  constructor(public store: Store<CryptoWarsState>) {
    super(store);

    this.addToSubscriptions(
      this.setUnitsMap()
    );
  }


  setUnitsMap() {
    return Observable.combineLatest(
      this.store.select(s => s.assets.units.data.listMap).distinctUntilChanged(),
      this.store.select(s => s.player.army).distinctUntilChanged(),
    ).subscribe(data => {
      let listMap = data[0];
      let army = data[1];
      let keys = Object.keys(army);

      let hp = 0
      let attack = 0
      let defense = 0
      keys.forEach(id => {
        hp += listMap[id].health * army[id];
        attack += listMap[id].attack * army[id];
        defense += listMap[id].defense * army[id];
      })

      this.armyStats =  Object.assign({}, this.armyStats, {hp, attack, defense});
    })
  }

}
