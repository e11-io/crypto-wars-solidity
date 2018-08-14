import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import { CryptoWarsState } from '../../app.state';

import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';
import { Unit, /*UnitMap,*/ UnitQuantitytMap } from '../../shared/models/unit.model';

import { PlayerArmyActions } from '../../../core/player/army/player-army.actions';

import * as selectors from '../../app.selectors';


@Component({
  selector: 'e11-battle-army-selection',
  templateUrl: './army-selection.component.html',
  styleUrls: ['./army-selection.component.scss']
})

export class BattleArmySelectionComponent extends AbstractContainerComponent {

  playerResources: any;
  units: Unit[] = [];
  unitsToBattle: UnitQuantitytMap = null;

  unitsForAttack$ = new BehaviorSubject<any>({});

  constructor(public store: Store<CryptoWarsState>) {
    super(store);

    this.addToSubscriptions(
      this.setPlayerResources(),
      this.setUnitsMap(),
      this.setUnitsForAttack(),
    );
  }

  ngOnInit() {
    this.store.select(s => s.player.army).take(1).subscribe(army => {
      let keys = Object.keys(army);
      if (keys.length > 0) {
        keys.forEach(id => {
          this.unitsToBattle[id] = army[id];
        })
        this.unitsForAttack$.next(Object.assign({}, this.unitsToBattle));
      }
    })
  }

  setPlayerResources() {
    return this.store.select(selectors.selectPlayerResources).subscribe(playerResources => {
      this.playerResources = playerResources;
    })
  }

  setUnitsMap() {
    return this.app$.map(app => app.unitsMap).subscribe(unitsMap => {
      this.units = Object.values(unitsMap);
      if (!this.unitsToBattle) {
        // NOTE We populate the unitsToBattle var so our sliders work fine at init
        this.unitsToBattle = {};
        this.units.forEach(unit => {
          this.unitsToBattle[unit.id] = unit.quantity;
        });
        this.unitsForAttack$.next(Object.assign({}, this.unitsToBattle));
      } else {
        let changed = false;
        this.units.forEach(unit => {
          if (this.unitsToBattle[unit.id] > unit.quantity) {
            this.unitsToBattle[unit.id] = unit.quantity;
            changed = true;
          }
        });
        if (changed) this.unitsForAttack$.next(Object.assign({}, this.unitsToBattle));
      }
    });
  }

  trackByFn(index, unit) {
    return unit.id;
  }

  rangeChanged(unitId, quantity) {
    if (this.unitsForAttack$.value[unitId] != quantity) {
      this.unitsForAttack$.next(Object.assign({},this.unitsToBattle));
    }
  }

  setUnitsForAttack() {
    return this.unitsForAttack$
      .debounceTime(400)
      .distinctUntilChanged((a, b) => {
        let identical = true;
        Object.keys(b).forEach(unitId => {
          if (a[unitId] != b[unitId]) identical = false;
        })
        return identical;
      })
      .subscribe(army => {
        this.store.dispatch(new PlayerArmyActions.SetArmy(army));
      });
  }

}
