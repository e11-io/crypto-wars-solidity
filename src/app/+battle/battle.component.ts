import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { PlayerTargetsActions } from '../../core/player/targets/player-targets.actions';
import { PlayerVillageService } from '../../core/player/village/player-village.service';

import { PlayerTarget } from '../../core/player/targets/player-target.model';
import { PlayerBattleActions } from '../../core/player/battle/player-battle.actions';
import { PlayerBattleService } from '../../core/player/battle/player-battle.service';

import { AbstractContainerComponent } from '../shared/components/abstract-container.component';

@Component({
  selector: 'e11-battle',
  templateUrl: './battle.component.html',
  styleUrls: ['./battle.component.scss']
})

export class BattleComponent extends AbstractContainerComponent {

  targets: PlayerTarget[] = [];

  constructor(public store: Store<any>,
              private activatedRoute: ActivatedRoute,
              private playerVillageService: PlayerVillageService,
              private playerBattleService: PlayerBattleService) {
    super(store);

  }

  refresh() {
    let activatedRoute = this.activatedRoute.children[this.activatedRoute.children.length - 1];
    if (activatedRoute.routeConfig.path === 'target') {
      this.store.dispatch(new PlayerTargetsActions.ClearTargets());
      this.store.dispatch(new PlayerTargetsActions.GetTargets());
    }
    if (activatedRoute.routeConfig.path === 'history') {
      this.store.dispatch(new PlayerBattleActions.ClearBattleHistory());
      this.store.dispatch(new PlayerBattleActions.GetBattleHistory());
    }
  }

}
