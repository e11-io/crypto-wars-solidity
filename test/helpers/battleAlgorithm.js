const unitsMock = require('../../data/test/units');
const battlesMock = require('../../data/test/battle');

// Stats
const stat = unitsMock.stats;
const {
  rewardDefenderModifier,
  rewardAttackerModifier
} = battlesMock.properties;


const battleAlgorithm = (attackerIds, attackerQuantities, defenderIds, defenderQuantities, defenderResources) => {
  const { defenderDeadQuantities, attackerDeadQuantities } = calculateBattleOutcome(attackerIds,
                                                                                    attackerQuantities,
                                                                                    defenderIds,
                                                                                    defenderQuantities);

  const { attackerRewards, knockedAttackerUnits } = calculateStealOutcome(attackerIds,
                                                                          attackerQuantities,
                                                                          defenderIds,
                                                                          defenderQuantities,
                                                                          defenderResources);

  const defenderRewards = getResourcesReward(attackerIds,
                                             attackerDeadQuantities,
                                             defenderIds,
                                             defenderDeadQuantities);
  return {
    attackerDeadQuantities,
    defenderDeadQuantities,
    attackerRewards,
    defenderRewards,
    knockedAttackerUnits
  }
};

const calculateBattleOutcome = (attackerIds, attackerQuantities, defenderIds, defenderQuantities) => {
  const attackerUnits = arrayOfIdsToUnit(attackerIds);
  const defenderUnits = arrayOfIdsToUnit(defenderIds);

  const attackerAttack = calculateAttack(attackerUnits, attackerQuantities);
  const attackerDefense = calculateDefense(attackerUnits, attackerQuantities);

  const defenderAttack = calculateAttack(defenderUnits, defenderQuantities);
  const defenderDefense = calculateDefense(defenderUnits, defenderQuantities);

  const trueDamageOfAttacker = (attackerAttack - defenderDefense);
  const trueDamageOfDefender = (defenderAttack - attackerDefense);

  const defenderDeadQuantities = damageUnits(trueDamageOfAttacker, defenderUnits, defenderQuantities);
  const attackerDeadQuantities = damageUnits(trueDamageOfDefender, attackerUnits, attackerQuantities);

  return {
    defenderDeadQuantities,
    attackerDeadQuantities
  }
}

const calculateStealOutcome = (attackerIds, attackerQuantities, defenderIds, defenderQuantities, defenderResources) => {
  const attackerUnits = arrayOfIdsToUnit(attackerIds);
  const defenderUnits = arrayOfIdsToUnit(defenderIds);

  const attackerAttack = calculateAttack(attackerUnits, attackerQuantities);
  const attackerDefense = calculateDefense(attackerUnits, attackerQuantities);

  const defenderAttack = calculateAttack(defenderUnits, defenderQuantities);
  const defenderDefense = calculateDefense(defenderUnits, defenderQuantities);

  let goldStolen = 0;
  let crystalStolen = 0;

  let knockedAttackerUnits = [];

  if (defenderDefense < attackerAttack && (defenderAttack < attackerDefense || defenderAttack === 0)) {
    knockedAttackerUnits = knockUnits(defenderAttack, attackerUnits, attackerQuantities);
    const totalUnitsThatCanSteal = knockedAttackerUnits.map((knockedAmount, i) => (attackerQuantities[i] - knockedAmount));
    const attackerAttackKnocked = calculateAttack(attackerUnits, totalUnitsThatCanSteal);
    const percentageStolen = Math.floor((attackerAttackKnocked  * rewardAttackerModifier) / attackerAttack);

    goldStolen = (percentageStolen * defenderResources.gold) / 100;
    crystalStolen = (percentageStolen * defenderResources.crystal) / 100;
  }

  // [gold, crystal]
  return { attackerRewards: [goldStolen, crystalStolen], knockedAttackerUnits };
}

const getResourcesReward = (attackerIds, attackerQuantities, defenderIds, defenderQuantities) => {
  const attackerUnits = arrayOfIdsToUnit(attackerIds);
  const defenderUnits = arrayOfIdsToUnit(defenderIds);

  let goldReward = 0;
  let crystalReward = 0;

  for (let i = 0; i < attackerUnits.length; i++) {
    if (attackerUnits[i].stats[stat.resource] == 0) {
      goldReward += (attackerUnits[i].stats[stat.price] * attackerQuantities[i]);
    }
    if (attackerUnits[i].stats[stat.resource] == 1) {
      crystalReward += (attackerUnits[i].stats[stat.price] * attackerQuantities[i]);
    }
  }

  for (let i = 0; i < defenderUnits.length; i++) {
    if (defenderUnits[i].stats[stat.resource] == 0) {
      goldReward += (defenderUnits[i].stats[stat.price] * defenderQuantities[i]);
    }
    if (defenderUnits[i].stats[stat.resource] == 1) {
      crystalReward += (defenderUnits[i].stats[stat.price] * defenderQuantities[i]);
    }
  }

  goldReward = (goldReward * rewardDefenderModifier / 100);
  crystalReward = (crystalReward * rewardDefenderModifier / 100);

  // [gold, crystal]
  return [goldReward, crystalReward];
}

const arrayOfIdsToUnit = (arrayOfIds) => {
  let units = [];
  for(let i = 0; i < arrayOfIds.length; i ++) {
    units.push(unitsMock.initialUnits.find(unit => unit.id == arrayOfIds[i]));
  }
  return units;
}

const damageUnits = (damage, units, quantities) => {
  let killedQuantities = quantities.map(() => 0); // create equal size array
  let zeroTroops = 0;
  while (damage > 0 && zeroTroops !== quantities.length) {
    const strongerUnitIndex = chooseIndexOfStrongerUnit(units, quantities, killedQuantities);
    const canKill = Math.floor(damage / units[strongerUnitIndex].stats[stat.health]);
    if (canKill > 0) {
      killedQuantities[strongerUnitIndex] = (canKill < quantities[strongerUnitIndex]) ? canKill : quantities[strongerUnitIndex];
      zeroTroops += (canKill < quantities[strongerUnitIndex]) ? 0 : 1;
      damage -= (killedQuantities[strongerUnitIndex] * units[strongerUnitIndex].stats[stat.health])
    } else {
      damage = 0;
    }
  }
  return killedQuantities;
};

const knockUnits = (damage, units, quantities) => {
  let knockedUnits = quantities.map(() => 0); // create equal size array
  let zeroTroops = 0;
  while (damage > 0 && zeroTroops !== quantities.length) {
    const strongerUnitIndex = chooseIndexOfStrongerUnit(units, quantities, knockedUnits);
    const canKnock = Math.floor(damage / units[strongerUnitIndex].stats[stat.defense]);
    if (canKnock > 0) {
      knockedUnits[strongerUnitIndex] = (canKnock < quantities[strongerUnitIndex]) ? canKnock : quantities[strongerUnitIndex];
      zeroTroops += (canKnock < quantities[strongerUnitIndex]) ? 0 : 1;
      damage -= (knockedUnits[strongerUnitIndex] * units[strongerUnitIndex].stats[stat.defense])
    } else {
      damage = 0;
    }
  }
  return knockedUnits;
}

const calculateAttack = (units, quantities) => {
  let totalAttack = 0;
  for (let i = 0; i < units.length; i++) {
    totalAttack += (units[i].stats[stat.attack] * quantities[i]);
  }
  return totalAttack;
};

const calculateDefense = (units, quantities) => {
  let totalDefense = 0;
  for (let i = 0; i < units.length; i++) {
    totalDefense += (units[i].stats[stat.defense] * quantities[i]);
  }
  return totalDefense;
}

const chooseIndexOfStrongerUnit = (units, quantities, killedQuantities) => {
  let indexOfStrongerUnit;
  let strongerDefense = -9999;
  for (let i = 0; i < units.length; i ++) {
    if (quantities[i] - killedQuantities[i] > 0 && (units[i].stats[stat.defense] > strongerDefense)) {
      indexOfStrongerUnit = i;
      strongerDefense = units[i].stats[stat.defense];
    }
  }
  return indexOfStrongerUnit;
}

const calculateFinalUnitsQuantities = (totalUnitsIds, totalUnitsQuiantities, attackerIds, killedQuantities) => {
  // TODO: remove this two, and add it to getParams helper. Its commented
  totalUnitsIds = totalUnitsIds.map(id => id.toNumber());
  totalUnitsQuiantities = totalUnitsQuiantities.map(amount => amount.toNumber());

  let indexes = [];
  totalUnitsIds.forEach((id, i) => {
    if (attackerIds.find(attackerId =>  attackerId == id)) {
      indexes.push(i);
    }
  });

  let calculatedFinalQuantities = totalUnitsQuiantities.concat([]);

  indexes.forEach((index, j) => {
    calculatedFinalQuantities[index] = totalUnitsQuiantities[index] - killedQuantities[j];
  });

  return calculatedFinalQuantities.filter(q => q > 0);
}

module.exports = {
  battleAlgorithm,
  calculateFinalUnitsQuantities
};
