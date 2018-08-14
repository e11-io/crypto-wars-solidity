import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/observable/forkJoin';
import { fromPromise } from 'rxjs/observable/fromPromise';

import { DataUnit } from '../../assets/units/data/data-unit.model';

@Injectable()
export class BattleAlgorithmService {

  constructor(){
  }

  getTotalBattleOutcome(rewards: any,
                        attackerUnits: DataUnit[],
                        attackerQuantities: number[],
                        defenderUnits: DataUnit[],
                        defenderQuantities: number[],
                        defenderResources: number[]) {
    const {
      defenderDeadQuantities,
      attackerDeadQuantities
    } = this.getBattleOutcome(attackerUnits,
                              attackerQuantities,
                              defenderUnits,
                              defenderQuantities);

    const attackerRewards = this.getStealOutcome(rewards,
                                                 attackerUnits,
                                                 attackerQuantities,
                                                 defenderUnits,
                                                 defenderQuantities,
                                                 defenderResources);

    const defenderRewards = this.getResourcesReward(rewards,
                                                    attackerUnits,
                                                    attackerDeadQuantities,
                                                    defenderUnits,
                                                    defenderDeadQuantities);
    return {
      attackerDeadQuantities,
      defenderDeadQuantities,
      attackerRewards,
      defenderRewards
    }
  }

  getBattleOutcome(attackerUnits: DataUnit[],
                   attackerQuantities: number[],
                   defenderUnits: DataUnit[],
                   defenderQuantities: number[]) {

    const attackerAttack: number = this.calculateAttack(attackerUnits, attackerQuantities);
    const attackerDefense: number = this.calculateDefense(attackerUnits, attackerQuantities);

    const defenderAttack: number = this.calculateAttack(defenderUnits, defenderQuantities);
    const defenderDefense: number = this.calculateDefense(defenderUnits, defenderQuantities);

    const trueDamageOfAttacker: number = (attackerAttack - defenderDefense);
    const trueDamageOfDefender: number = (defenderAttack - attackerDefense);

    const defenderDeadQuantities: number[] = this.damageUnits(trueDamageOfAttacker, defenderUnits, defenderQuantities);
    const attackerDeadQuantities: number[] = this.damageUnits(trueDamageOfDefender, attackerUnits, attackerQuantities);

    return {
      defenderDeadQuantities,
      attackerDeadQuantities
    }
  }

  getStealOutcome(rewards: any,
                  attackerUnits: DataUnit[],
                  attackerQuantities: number[],
                  defenderUnits: DataUnit[],
                  defenderQuantities: number[],
                  defenderResources: number[]) {

    const rewardAttackerModifier: number = rewards.attacker;

    const attackerAttack: number = this.calculateAttack(attackerUnits, attackerQuantities);
    const attackerDefense: number = this.calculateDefense(attackerUnits, attackerQuantities);

    const defenderAttack: number = this.calculateAttack(defenderUnits, defenderQuantities);
    const defenderDefense: number = this.calculateDefense(defenderUnits, defenderQuantities);

    let goldStolen: number = 0;
    let crystalStolen: number = 0;

    let knockedAttackerUnits: number[] = [];

    if (defenderDefense < attackerAttack && (defenderAttack < attackerDefense || defenderAttack === 0)) {
      knockedAttackerUnits = this.knockUnits(defenderAttack, attackerUnits, attackerQuantities);
      const totalUnitsThatCanSteal = knockedAttackerUnits.map((knockedAmount, i) => (attackerQuantities[i] - knockedAmount));
      const attackerAttackAfterKnocked = this.calculateAttack(attackerUnits, totalUnitsThatCanSteal);
      const percentageStolen = Math.floor((attackerAttackAfterKnocked  * rewardAttackerModifier) / attackerAttack);

      goldStolen = (percentageStolen * defenderResources[0]) / 100;
      crystalStolen = (percentageStolen * defenderResources[1]) / 100;
    }

    return [goldStolen, crystalStolen];
  }

  getResourcesReward(rewards: any,
                     attackerUnits: DataUnit[],
                     attackerDeadQuantities: number[],
                     defenderUnits: DataUnit[],
                     defenderDeadQuantities: number[]) {

    const rewardDefenderModifier: number = rewards.defender;

    let goldReward: number = 0;
    let crystalReward: number = 0;

    for (let i = 0; i < attackerUnits.length; i++) {
     if (attackerUnits[i].resource === 'gold') {
       goldReward += (attackerUnits[i].price * attackerDeadQuantities[i]);
     }
     if (attackerUnits[i].resource === 'crystal') {
       crystalReward += (attackerUnits[i].price * attackerDeadQuantities[i]);
     }
    }

    for (let i = 0; i < defenderUnits.length; i++) {
     if (defenderUnits[i].resource === 'gold') {
       goldReward += (defenderUnits[i].price * defenderDeadQuantities[i]);
     }
     if (defenderUnits[i].resource === 'crystal') {
       crystalReward += (defenderUnits[i].price * defenderDeadQuantities[i]);
     }
    }

    goldReward = (goldReward * rewardDefenderModifier / 100);
    crystalReward = (crystalReward * rewardDefenderModifier / 100);

    return [goldReward, crystalReward];
  }

  calculateAttack(units: DataUnit[], quantities: number[]) {
    let totalAttack: number = 0;
    units.forEach((unit, i) => {
      totalAttack += unit.attack * quantities[i];
    });
    return totalAttack;
  }

  calculateDefense(units: DataUnit[], quantities: number[]) {
    let totalDefense: number = 0;
    units.forEach((unit, i) => {
      totalDefense += unit.defense * quantities[i];
    });
    return totalDefense;
  }

  damageUnits(damage: number, units: DataUnit[], quantities: number[]) {
    let killedQuantities: number[] = quantities.map(() => 0); // create equal size array
    let zeroedTroops: number = 0;
    while (damage > 0 && zeroedTroops !== quantities.length) {
      const strongerUnitIndex: number = this.chooseIndexOfStrongerUnit(units, quantities, killedQuantities);
      const canKill: number = Math.floor(damage / units[strongerUnitIndex].health);
      if (canKill > 0) {
        killedQuantities[strongerUnitIndex] = (canKill < quantities[strongerUnitIndex]) ? canKill : quantities[strongerUnitIndex];
        if (canKill < quantities[strongerUnitIndex]) {
            damage = 0;
        } else {
          zeroedTroops += 1;
          damage -= (killedQuantities[strongerUnitIndex] * units[strongerUnitIndex].health)
        }
      } else {
        damage = 0;
      }
    }
    return killedQuantities;
  }

  knockUnits(damage: number, units: DataUnit[], quantities: number[]) {
    let knockedQuantities: number[] = quantities.map(() => 0); // create equal size array
    let zeroedTroops: number = 0;
    while (damage > 0 && zeroedTroops !== quantities.length) {
      const strongerUnitIndex: number = this.chooseIndexOfStrongerUnit(units, quantities, knockedQuantities);
      const canKnock: number = Math.floor(damage / units[strongerUnitIndex].defense);
      if (canKnock > 0) {
        knockedQuantities[strongerUnitIndex] = (canKnock < quantities[strongerUnitIndex]) ? canKnock : quantities[strongerUnitIndex];
        if (canKnock < quantities[strongerUnitIndex]) {
            damage = 0;
        } else {
          zeroedTroops += 1;
          damage -= (knockedQuantities[strongerUnitIndex] * units[strongerUnitIndex].defense)
        }
      } else {
        damage = 0;
      }
    }
    return knockedQuantities;
  }

  chooseIndexOfStrongerUnit(units: DataUnit[], quantities: number[], unavailableQuantities: number[]) {
    let indexOfStrongerUnit: number = 0;
    let strongerDefense:number = -1;
    for (let i = 0; i < units.length; i ++) {
      if (quantities[i] - unavailableQuantities[i] > 0 && (units[i].defense > strongerDefense)) {
        indexOfStrongerUnit = i;
        strongerDefense = units[i].defense;
      }
    }
    return indexOfStrongerUnit;
  }

}
