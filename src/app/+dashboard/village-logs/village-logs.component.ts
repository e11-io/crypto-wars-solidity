import { Component, Input, EventEmitter, Output } from '@angular/core';
import { Router } from "@angular/router";
import { Store } from '@ngrx/store';
import { BattleDetail } from '../../../core/player/battle/battle-detail.model';
import { PlayerBattleActions } from '../../../core/player/battle/player-battle.actions';

import { getCurrentBlockFromStore } from '../../shared/util/helpers';

@Component({
  selector: 'e11-village-logs',
  templateUrl: './village-logs.component.html',
  styleUrls: ['./village-logs.component.scss']
})

export class VillageLogsComponent {

  @Input() battleDetails: BattleDetail[] = [];
  @Output() logClicked: EventEmitter<any> = new EventEmitter<any>();

  currentBlock: number;
  resources: string[] = ['gold', 'crystal', 'quantum'];

  constructor(public store: Store<any>,
              private router: Router) {
      this.currentBlock = getCurrentBlockFromStore(this.store);
  }

  trackByFn(index, battleDetail) {
    return battleDetail.village.address;
  }

  log(selectedBattle: BattleDetail) {
    this.logClicked.emit(selectedBattle);
  }
}
