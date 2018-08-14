import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';

import { PlayerVillageService } from '../../../core/player/village/player-village.service';

import { PlayerTarget } from '../../../core/player/targets/player-target.model';
import { PlayerTargetsActions } from '../../../core/player/targets/player-targets.actions';

import { BattleDetail } from '../../../core/player/battle/battle-detail.model';
import { PlayerBattleActions } from '../../../core/player/battle/player-battle.actions';
import { PlayerBattleService } from '../../../core/player/battle/player-battle.service';

import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';
import { UnitMap } from '../../shared/models/unit.model';

@Component({
  selector: 'e11-battle-target',
  templateUrl: './target.component.html',
  styleUrls: ['./target.component.scss']
})

export class BattleTargetComponent extends AbstractContainerComponent implements OnInit {

  targets: PlayerTarget[] = [];
  targetsMap: any = {};
  battleDetails: BattleDetail[] = [];
  unitsMap: UnitMap = {};
  targetsLoading: boolean = false;
  hasArmy: boolean = false;
  attackCooldown: number = 0;
  expandedTargetId: string;

  constructor(public store: Store<any>,
              private playerVillageService: PlayerVillageService,
              private playerBattleService: PlayerBattleService) {
    super(store);
    this.addToSubscriptions(
      this.setStatus(),
      this.setTargets(),
      this.setArmy(),
      this.setAttackCooldown(),
      this.setUnits(),
      this.setExpandedTarget()
    );
  }

  ngOnInit() {
    if (!this.targets || this.targets.length === 0) {
      this.store.dispatch(new PlayerTargetsActions.GetTargets());
    }
  }

  setStatus() {
    return this.store.select(s => s.player.targets.status).skip(1).distinctUntilChanged((a, b) => a.loading == b.loading).subscribe(status => {
      this.targetsLoading = status.loading;
    })
  }

  setTargets() {
    return this.store.select(s => s.player.targets).distinctUntilChanged((a, b) => a.targetsNonce == b.targetsNonce).subscribe(targetsState => {
      this.targets = targetsState.targets;
      let targetsMap: any = {};
      this.targets.forEach(target => targetsMap[target.address] = target);
      this.targetsMap = targetsMap;
      this.parseTargets();
    })
  }

  setArmy() {
    return this.store.select(s => s.player.army).distinctUntilChanged().subscribe(army => {
      this.updateHasArmy(army);
      this.parseTargets();
    })
  }

  setAttackCooldown() {
    return Observable.combineLatest(
      this.store.select(s => s.player.battle.lastAttackBlock).distinctUntilChanged(),
      this.store.select(s => s.player.battle.attackCooldown).distinctUntilChanged(),
      this.store.select(s => s.web3.lastBlock).distinctUntilChanged(),
    ).subscribe(data => {
      const lastAttackBlock = data[0];
      const attackCooldown = data[1];
      const lastBlock = data[2];
      this.attackCooldown = (lastAttackBlock + attackCooldown > lastBlock)? (lastAttackBlock + attackCooldown) - lastBlock : 0;
    })
  }

  setUnits() {
    return this.store.select(s => s.app.unitsMap).subscribe(unitsMap => {
      this.unitsMap = unitsMap;
    });
  }

  setExpandedTarget() {
    return this.store.select(s => s.player.targets.expandedTarget).distinctUntilChanged().subscribe(targetId => {
      this.expandedTargetId = targetId;
    });
  }

  expandTargetDetail(id: string) {
    this.store.dispatch(new PlayerTargetsActions.SelectTarget(id));
  }

  updateHasArmy(army: number[]) {
    let doesHaveArmy = false;
    const armyIds = Object.keys(army);
    for (let i = 0; i < armyIds.length && !doesHaveArmy; i ++) {
      doesHaveArmy = (army[armyIds[i]] !== 0);
    }
    this.hasArmy = doesHaveArmy;
  }

  parseTargets() {
    this.battleDetails = this.targets.map(target => this.getBattleStats(target)).filter(i => !!i);
  }

  getBattleStats(target: PlayerTarget) {
    if (!target.canAttack) {
      return;
    }
    return this.playerBattleService.getTotalBattleOutcome(target);
  }

  battleDetailClicked(battleDetail: BattleDetail) {
    if (this.attackCooldown > 0) return;
    let army = battleDetail.army.attacker.filter(unit => unit.total > 0);
    this.store.dispatch(new PlayerBattleActions.Attack({
      address: battleDetail.village.address,
      ids: army.map(unit => unit.id),
      quantities: army.map(unit => unit.total),
    }));
  }

  findMoreTargets() {
    if (!this.targetsLoading) {
      this.store.dispatch(new PlayerTargetsActions.GetTargets());
    }
  }

}
