import { Component, Input, EventEmitter, Output } from '@angular/core';

import { BattleDetail } from '../../../core/player/battle/battle-detail.model';
import { PlayerTarget } from '../../../core/player/targets/player-target.model';
import { UnitMap } from '../../shared/models/unit.model';

@Component({
  selector: 'e11-targets-list',
  templateUrl: './targets-list.component.html',
  styleUrls: ['./targets-list.component.scss']
})

export class TargetsListComponent {

  @Input() battleDetails: BattleDetail[] = [];
  @Input() targetsMap: any = {};
  @Input() unitsMap: UnitMap = {};
  @Input() attackCooldown: number = 0;
  @Input() expandedBattleId: string = '';

  @Output() battleDetailClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() battleDetailEmitter: EventEmitter<any> = new EventEmitter<any>();

  statsName: string[] = ['dmg', 'def', 'hp'];
  resources: string[] = ['gold', 'crystal', 'quantum'];

  constructor() {
  }

  expandBattleDetail(id: string) {
    this.battleDetailEmitter.emit(id);
  }

  collapseBattleDetail(id: string) {
    if (!this.expandedBattleId || this.expandedBattleId != id) {
      this.battleDetailEmitter.emit(id);
      return;
    }
    this.battleDetailEmitter.emit('');
  }

  trackByFn(index, battleDetail) {
    return battleDetail.village.address;
  }

  battleDetailAction(battleDetail: BattleDetail) {
    this.battleDetailClicked.emit(battleDetail);
  }

}
