import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import { PlayerBattleActions } from '../../../core/player/battle/player-battle.actions';
import { PlayerTargetsActions } from '../../../core/player/targets/player-targets.actions';

import { PlayerBattleService } from '../../../core/player/battle/player-battle.service';
import { BattleDetail } from '../../../core/player/battle/battle-detail.model';

import { AbstractContainerComponent } from '../../shared/components/abstract-container.component';
import { UnitMap } from '../../shared/models/unit.model';

@Component({
  selector: 'e11-battle-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class BattleHistoryComponent extends AbstractContainerComponent implements OnInit {

  battleDetails: BattleDetail[] = [];
  unitsMap: UnitMap = {};
  battlesLoading: boolean = false;
  attackCooldown: number = 0;
  expandedBattleId: string;

  constructor(public store: Store<any>,
              private router: Router,
              private playerBattleService: PlayerBattleService) {
    super(store);
    this.addToSubscriptions(
      this.store.select(s => s.player.battle.status).skip(1).distinctUntilChanged((a, b) => a.loading == b.loading).subscribe(status => {
        this.battlesLoading = status.loading;
      }),
      this.setBattles(),
      this.setUnits(),
      this.setExpandedBattle(),
      Observable.combineLatest(
        this.store.select(s => s.player.battle.lastAttackBlock).distinctUntilChanged(),
        this.store.select(s => s.player.battle.attackCooldown).distinctUntilChanged(),
        this.store.select(s => s.web3.lastBlock).distinctUntilChanged(),
      ).subscribe(data => {
        const lastAttackBlock = data[0];
        const attackCooldown = data[1];
        const lastBlock = data[2];
        this.attackCooldown = (lastAttackBlock + attackCooldown > lastBlock)? (lastAttackBlock + attackCooldown) - lastBlock : 0;
      }),
    );
  }

  ngOnInit() {
    if (!this.battleDetails || this.battleDetails.length === 0) {
      this.store.dispatch(new PlayerBattleActions.ClearBattleHistory());
      this.store.dispatch(new PlayerBattleActions.GetBattleHistory());
    }
  }

  battleDetailClicked(battleDetail: BattleDetail) {
    if (!battleDetail.village.canAttack && !battleDetail.village.canTakeRevenge) return;
    this.store.dispatch(new PlayerTargetsActions.GetTarget(battleDetail.village.address));
    this.store.dispatch(new PlayerTargetsActions.SelectTarget(battleDetail.village.address));
    this.router.navigate(['/battle/target']);
  }

  expandBattleDetail(id: string) {
    this.store.dispatch(new PlayerBattleActions.SelectBattleDetail(id));
  }

  setExpandedBattle() {
    return this.store.select(s => s.player.battle.expandedBattleDetail).distinctUntilChanged().subscribe(battleId => {
      this.expandedBattleId = battleId;
    });
  }

  setBattles() {
    return this.store.select(s => s.player.battle.battles).distinctUntilChanged().subscribe(battles => {
      this.battleDetails = battles;
    });
  }

  setUnits() {
    return this.store.select(s => s.app.unitsMap).subscribe(unitsMap => {
      this.unitsMap = unitsMap;
    });
  }

  findMoreBattles() {
    if (!this.battlesLoading) {
      this.store.dispatch(new PlayerBattleActions.GetBattleHistory());
    }
  }

}
















// targets: any = [
//   {
//     id: '11',
//     name: 'Norman Hammond',
//     villageName: 'Pichichi',
//     allianceName: '',
//     type: 'attacker',
//     army: {
//       rate: 4,
//       stats: [
//         { name: 'hp', qty: 1200 },
//         { name: 'dmg', qty: 750 },
//         { name: 'def', qty: 235 }
//       ],
//       data: [
//         { name: 'tiny_warrior', qty: 10 },
//         { name: 'guardian', qty: 3 }
//       ]
//     },
//     resources: {
//       rate: 4,
//       data: [
//         { name: 'gold', qty: 5000 },
//         { name: 'crystal', qty: 5000 },
//         { name: 'quantum', qty: 5000 }
//       ]
//     },
//     potentialResources: {
//       rate: 3,
//       data: [
//         { name: 'gold', qty: 35622 },
//         { name: 'crystal', qty: 14239 },
//         { name: 'quantum', qty: 100 }
//       ]
//     },
//     potentialCasualties: {
//       rate: 4,
//       data: [
//         { name: 'tiny_warrior', qty: 3000 },
//         { name: 'archer', qty: 723 },
//         { name: 'guardian', qty: 132 }
//       ]
//     }
//   },
//   {
//     id: '21',
//     name: 'Norman k',
//     villageName: 'Pichichi',
//     allianceName: 'DragonOwners',
//     type: 'defender',
//     army: {
//       rate: 4,
//       stats: [
//         { name: 'hp', qty: 1200 },
//         { name: 'dmg', qty: 750 },
//         { name: 'def', qty: 235 }
//       ],
//       data: [
//         { name: 'tiny_warrior', qty: 10 },
//         { name: 'guardian', qty: 3 }
//       ]
//     },
//     resources: {
//       rate: 4,
//       data: [
//         { name: 'gold', qty: 5000 },
//         { name: 'crystal', qty: 5000 },
//         { name: 'quantum', qty: 5000 }
//       ]
//     },
//     potentialResources: {
//       rate: 5,
//       data: [
//         { name: 'gold', qty: 75622 },
//         { name: 'crystal', qty: 44239 },
//         { name: 'quantum', qty: 3500 }
//       ]
//     },
//     potentialCasualties: {
//       rate: 1,
//       data: [
//         { name: 'tiny_warrior', qty: 30 },
//         { name: 'archer', qty: 4 },
//         { name: 'guardian', qty: 1 }
//       ]
//     }
//   },
//   {
//     id: '31',
//     name: 'Leslie B',
//     villageName: '11-14',
//     allianceName: '',
//     type: 'attacker',
//     army: {
//       rate: 4,
//       stats: [
//         { name: 'hp', qty: 1200 },
//         { name: 'dmg', qty: 750 },
//         { name: 'def', qty: 235 }
//       ],
//       data: [
//         { name: 'tiny_warrior', qty: 10 },
//         { name: 'guardian', qty: 3 }
//       ]
//     },
//     resources: {
//       rate: 4,
//       data: [
//         { name: 'gold', qty: 5000 },
//         { name: 'crystal', qty: 5000 },
//         { name: 'quantum', qty: 5000 }
//       ]
//     },
//     potentialResources: {
//       rate: 2,
//       data: [
//         { name: 'gold', qty: 25622 },
//         { name: 'crystal', qty: 7239 },
//         { name: 'quantum', qty: 83 }
//       ]
//     },
//     potentialCasualties: {
//       rate: 2,
//       data: [
//         { name: 'tiny_warrior', qty: 300 },
//         { name: 'archer', qty: 45 },
//         { name: 'guardian', qty: 10 }
//       ]
//     }
//   },
//   {
//     id: '41',
//     name: 'Nobody Leti',
//     villageName: 'Speed Ballons',
//     allianceName: 'Suiters',
//     type: 'defender',
//     army: {
//       rate: 4,
//       stats: [
//         { name: 'hp', qty: 1200 },
//         { name: 'dmg', qty: 750 },
//         { name: 'def', qty: 235 }
//       ],
//       data: [
//         { name: 'tiny_warrior', qty: 10 },
//         { name: 'guardian', qty: 3 }
//       ]
//     },
//     resources: {
//       rate: 4,
//       data: [
//         { name: 'gold', qty: 5000 },
//         { name: 'crystal', qty: 5000 },
//         { name: 'quantum', qty: 5000 }
//       ]
//     },
//     potentialResources: {
//       rate: 1,
//       data: [
//         { name: 'gold', qty: 3562 },
//         { name: 'crystal', qty: 1423 },
//         { name: 'quantum', qty: 10 }
//       ]
//     },
//     potentialCasualties: {
//       rate: 4,
//       data: [
//         { name: 'tiny_warrior', qty: 3232 },
//         { name: 'archer', qty: 923 },
//         { name: 'guardian', qty: 189 }
//       ]
//     }
//   },
//   {
//     id: '51',
//     name: 'Lucas Pitch',
//     villageName: 'BananaLand',
//     allianceName: 'Sinners',
//     type: 'defender',
//     army: {
//       rate: 4,
//       stats: [
//         { name: 'hp', qty: 1200 },
//         { name: 'dmg', qty: 750 },
//         { name: 'def', qty: 235 }
//       ],
//       data: [
//         { name: 'tiny_warrior', qty: 10 },
//         { name: 'guardian', qty: 3 }
//       ]
//     },
//     resources: {
//       rate: 4,
//       data: [
//         { name: 'gold', qty: 5000 },
//         { name: 'crystal', qty: 5000 },
//         { name: 'quantum', qty: 5000 }
//       ]
//     },
//     potentialResources: {
//       rate: 0,
//       data: [
//         { name: 'gold', qty: 50 },
//         { name: 'crystal', qty: 100 },
//         { name: 'quantum', qty: 0 }
//       ]
//     },
//     potentialCasualties: {
//       rate: 5,
//       data: [
//         { name: 'tiny_warrior', qty: 3522 },
//         { name: 'archer', qty: 722 },
//         { name: 'guardian', qty: 132 }
//       ]
//     }
//   }
// ];
