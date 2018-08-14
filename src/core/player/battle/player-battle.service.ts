import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';
import { fromPromise } from 'rxjs/observable/fromPromise';
import BigNumber from 'bn.js';

import { updateAndfilterUniqueBattleHistories } from '../../../app/shared/util/helpers';

import { ContractsService } from '../../shared/contracts.service';
import { Web3Service } from '../../web3/web3.service';
import { DataUnit } from '../../assets/units/data/data-unit.model';
import { PlayerTarget } from '../targets/player-target.model';

import { PlayerResources } from '../resources/player-resources.model';
import { VillageInfo } from '../village/village-info.model';

import { PlayerBattle } from './player-battle.model';
import { PlayerVillageService } from '../village/player-village.service';
import { BattleAlgorithmService } from './battle-algorithm.service';
import { BattleDetail, BattleArmy, BattleResources, BattleUnit, Casualties } from './battle-detail.model';

@Injectable()
export class PlayerBattleService {

  constructor(private contractsService: ContractsService,
              private store: Store<any>,
              private battleAlgorithmService: BattleAlgorithmService,
              private playerVillageService: PlayerVillageService,
              private web3Service: Web3Service){


  }

  getBattleRewardModifiers() {
    return Observable.forkJoin(
      ['getRewardAttackerModifier', 'getRewardDefenderModifier'].map(functionName =>
        this.web3Service.callContract(
          this.contractsService.BattleSystemInstance[functionName],
          []
        ).then((result) => {
          if (!result || result.error) {
            return result;
          }
          return result.toNumber();
        })
      )
    );
  }

  getAttackCooldown() {
    return fromPromise(this.web3Service.callContract(
      this.contractsService.BattleSystemInstance.getAttackCooldown,
      []
    ).then((result) => {
      if (!result || result.error) {
        return result;
      }
      return result.toNumber();
    }));
  }

  getLastAttackBlock(address: string) {
    return fromPromise(this.web3Service.callContract(
      this.contractsService.BattleSystemInstance.userLastAttack,
      [address]
    ).then((result) => {
      if (!result || result.error) {
        return result;
      }
      return result.toNumber();
    }));
  }

  getTotalBattleOutcome(target: PlayerTarget) : BattleDetail {
    let state;
    this.store.take(1).subscribe(store => {
      state = store;
    });
    let rewards = {
      attacker: state.player.battle.rewardAttackerModifier,
      defender: state.player.battle.rewardDefenderModifier,
    };
    let army = state.player.army;
    if (!army || Object.keys(army).length == 0) return;
    let unitsMap = state.assets.units.data.listMap;

    let attackerUnits: DataUnit[] = Object.keys(army).map(id => unitsMap[id]);
    let attackerQuantities: number[] = Object.values(army);
    if (attackerQuantities.filter(quantity => quantity > 0).length == 0) return;

    let defenderUnits = target.unitsIds.map(id => unitsMap[id]);
    let defenderQuantities = target.unitsQuantities;
    let defenderResources = target.resources;

    let totalCapacity = state.player.resources.goldCapacity + state.player.resources.crystalCapacity;

    /// Filter unused units
    attackerUnits = attackerUnits.filter((unit, i) => attackerQuantities[i] > 0);
    attackerQuantities = attackerQuantities.filter((quantity) => quantity > 0);

    let result = this.battleAlgorithmService.getTotalBattleOutcome(
      rewards,
      attackerUnits,
      attackerQuantities,
      defenderUnits,
      defenderQuantities,
      defenderResources
    );

    let attackerBattleStats: number = 0;
    attackerUnits.forEach((unit, i) => {
      attackerBattleStats += (unit.attack + unit.defense + unit.health) * attackerQuantities[i];
    });
    let defenderBattleStats: number = target.battleStats.reduce((acc, stat) => acc + stat, 0);

    let totalAttackerUnits = attackerQuantities.reduce((a,b) => a + b, 0);
    let totalAttackerDeadUnits = result.attackerDeadQuantities.reduce((a,b) => a + b, 0);
    let totalDefenderUnits = defenderQuantities.reduce((a,b) => a + b, 0);
    let totalDefenderDeadUnits = result.defenderDeadQuantities.reduce((a,b) => a + b, 0);

    return new BattleDetail({
      id: target.address,
      attacked: false,
      defended: false,
      village: new VillageInfo(target),
      casualties: new Casualties({
        attacker: {
          total: totalAttackerUnits,
          dead: totalAttackerDeadUnits,
          percent: totalAttackerUnits > 0 ? Math.round((totalAttackerDeadUnits * 100) / totalAttackerUnits) : 100,
          rate: totalAttackerUnits > 0 ? Math.round((totalAttackerDeadUnits * 5) / totalAttackerUnits) : 100,
        },
        defender: {
          total: totalDefenderUnits,
          dead: totalDefenderDeadUnits,
          percent: totalDefenderUnits > 0 ? Math.round((totalDefenderDeadUnits * 100) / totalDefenderUnits) : 100,
          rate: totalDefenderUnits > 0 ? Math.round((totalDefenderDeadUnits * 5) / totalDefenderUnits) : 100,
        }
      }),
      army: new BattleArmy({
        rate: Math.round((defenderBattleStats / attackerBattleStats) * 5),
        attacker: attackerUnits.map((unit, i) => new BattleUnit({
          id: unit.id,
          total: attackerQuantities[i],
          dead: result.attackerDeadQuantities[i],
        })),
        defender: defenderUnits.map((unit, i) => new BattleUnit({
          id: unit.id,
          total: defenderQuantities[i],
          dead: result.defenderDeadQuantities[i],
        })),
      }),
      resources: new BattleResources({
        rate: Math.round((((defenderResources[0] + defenderResources[1]) / (100 / rewards.attacker)) / totalCapacity)  * 5),
        defenderTotal: new PlayerResources({
          gold: defenderResources[0],
          crystal: defenderResources[1],
          quantum: defenderResources[2],
        }),
        defenderReward: new PlayerResources({
          gold: result.defenderRewards[0],
          crystal: result.defenderRewards[1],
          quantum: result.defenderRewards[2],
        }),
        attackerReward: new PlayerResources({
          gold: result.attackerRewards[0],
          crystal: result.attackerRewards[1],
          quantum: result.attackerRewards[2],
        }),
      }),
    });
  }

  getBattleHistory(data) {
    return new Promise((resolve, reject) => {
      const whenAttackerUnitsPromise = this.web3Service.getEvents(
        this.contractsService.BattleSystemInstance.AttackUnits,
        data.currentBlock,
        data.searchThreshold,
        { attacker: data.account }
      );
      const whenAttackerRewardsPromise = this.web3Service.getEvents(
        this.contractsService.BattleSystemInstance.AttackRewards,
        data.currentBlock,
        data.searchThreshold,
        { attacker: data.account }
      );
      const whenDefenderUnitsPromise = this.web3Service.getEvents(
        this.contractsService.BattleSystemInstance.AttackUnits,
        data.currentBlock,
        data.searchThreshold,
        { defender: data.account }
      );
      const whenDefenderRewardsPromise = this.web3Service.getEvents(
        this.contractsService.BattleSystemInstance.AttackRewards,
        data.currentBlock,
        data.searchThreshold,
        { defender: data.account }
      );

      Promise.all([
        whenAttackerUnitsPromise,
        whenAttackerRewardsPromise,
        whenDefenderUnitsPromise,
        whenDefenderRewardsPromise
      ]).then((battleEvents: any) => {
        if (battleEvents.error) {
          return { error: battleEvents.error };
        }
        let battleHistories = [];
        const attackUnitsWhenAttacker = (battleEvents[0].data) ? battleEvents[0].data : [];
        const attackRewardsWhenAttacker = (battleEvents[1].data) ? battleEvents[1].data : [];
        const attackUnitsWhenDefender = (battleEvents[2].data) ? battleEvents[2].data : [];
        const attackRewardsWhenDefender = (battleEvents[3].data) ? battleEvents[3].data : [];
        for (let i = 0; i < attackUnitsWhenAttacker.length; i ++) { // O(n)
          battleHistories.push({
            ...attackUnitsWhenAttacker[i].args,
            ...attackRewardsWhenAttacker[i].args,
            transactionHash: attackUnitsWhenAttacker[i].transactionHash,
            blockNumber: attackUnitsWhenAttacker[i].blockNumber
          });
        }
        for (let i = 0; i < attackUnitsWhenDefender.length; i ++) { // O(m)
          battleHistories.push({
            ...attackUnitsWhenDefender[i].args,
            ...attackRewardsWhenDefender[i].args,
            transactionHash: attackUnitsWhenDefender[i].transactionHash,
            blockNumber: attackUnitsWhenDefender[i].blockNumber
          });
        }
        // Since we wont have them ordered 'cause we call once to get when he attacked
        // and once he attacked, we ordered it by blocknumber
        battleHistories = battleHistories.sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber)); // O(m*n)

        let addressesOfUsers = battleHistories.map(battleData =>
          (data.account.toLowerCase() === battleData.attacker.toLowerCase()) ? battleData.defender : battleData.attacker
        );

        // filter unique addresses
        let uniqueAddressesOfUsers = addressesOfUsers.filter((addressOfUsers, i) => addressesOfUsers.indexOf(addressOfUsers) == i);
        this.playerVillageService.getUserInfo(data.account, uniqueAddressesOfUsers).subscribe((villages: VillageInfo[]) => {
          let villagesOfUsers: any = {};
          villages.forEach(village => {
            villagesOfUsers[village.address] = village;
          });

          battleHistories = battleHistories.map((battleData, i) => {
            let totalAttackerUnits = 0;
            let totalAttackerDeadUnits = 0;
            let totalDefenderUnits = 0;
            let totalDefenderDeadUnits = 0;

            for (let j = 0; j < battleData.attackerQuantities.length; j ++)
              totalAttackerUnits += battleData.attackerQuantities[j].toNumber();

            for (let j = 0; j < battleData.attackerDeadQuantities.length; j ++)
              totalAttackerDeadUnits += battleData.attackerDeadQuantities[j].toNumber();

            for (let j = 0; j < battleData.defenderQuantities.length; j ++)
              totalDefenderUnits += battleData.defenderQuantities[j].toNumber();

            for (let j = 0; j < battleData.defenderDeadQuantities.length; j ++)
              totalDefenderDeadUnits += battleData.defenderDeadQuantities[j].toNumber();

            let userOnBattle = (data.account.toLowerCase() === battleData.attacker.toLowerCase()) ? battleData.defender : battleData.attacker;
            this.playerVillageService.getUserInfo(data.account, [userOnBattle]).subscribe((villages: VillageInfo[]) => {
              userOnBattle = villages[0];
            });

            return new BattleDetail({
              id: battleData.transactionHash,
              block: battleData.blockNumber,
              attacked: (data.account.toLowerCase() === battleData.attacker.toLowerCase()),
              defended: (data.account.toLowerCase() === battleData.defender.toLowerCase()),
              village: villagesOfUsers[addressesOfUsers[i]],
              casualties: new Casualties({
                attacker: {
                  total: totalAttackerUnits,
                  dead: totalAttackerDeadUnits,
                  percent: totalAttackerUnits > 0 ? Math.round((totalAttackerDeadUnits * 100) / totalAttackerUnits) : 100,
                  rate: totalAttackerUnits > 0 ? Math.round((totalAttackerDeadUnits * 5) / totalAttackerUnits) : 100,
                },
                defender: {
                  total: totalDefenderUnits,
                  dead: totalDefenderDeadUnits,
                  percent: totalDefenderUnits > 0 ? Math.round((totalDefenderDeadUnits * 100) / totalDefenderUnits) : 100,
                  rate: totalDefenderUnits > 0 ? Math.round((totalDefenderDeadUnits * 5) / totalDefenderUnits) : 100,
                }
              }),
              army: new BattleArmy({
                attacker: battleData.attackerIds.map((id, i) => new BattleUnit({
                  id: id,
                  total: battleData.attackerQuantities[i],
                  dead: battleData.attackerDeadQuantities[i],
                })),
                defender: battleData.defenderIds.map((id, i) => new BattleUnit({
                  id: id,
                  total: battleData.defenderQuantities[i],
                  dead: battleData.defenderDeadQuantities[i],
                })),
              }),
              resources: new BattleResources({
                defenderTotal: new PlayerResources(),
                defenderReward: new PlayerResources({
                  gold: battleData.defenderRewards[0],
                  crystal: battleData.defenderRewards[1],
                  quantum: battleData.defenderRewards[2],
                }),
                attackerReward: new PlayerResources({
                  gold: battleData.attackerRewards[0],
                  crystal: battleData.attackerRewards[1],
                  quantum: battleData.attackerRewards[2],
                }),
              }),
            });
          });
          data.newHistories = battleHistories.length;
          data.battles = updateAndfilterUniqueBattleHistories(data.battles.concat(battleHistories));
          resolve(data);
        });
      });
    });
  }
}
