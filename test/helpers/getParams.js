let userResources;
let userUnits;

module.exports = {
  setUserResources: (_userResources) => {
    userResources = _userResources;
  },

  setUserUnits: (_userUnits) => {
    userUnits = _userUnits;
  },

  getParams: async (Alice, Bob) => {
    let [alice_gold, alice_crystal] = await userResources.getUserResources.call(Alice);
    let [bob_gold, bob_crystal] = await userResources.getUserResources.call(Bob);
    let [bob_gold_capacity, bob_crystal_capacity] = await userResources.calculateUserResourcesCapacity.call(Bob);

    alice_gold = alice_gold.toNumber();
    alice_crystal = alice_crystal.toNumber();
    bob_gold = bob_gold.toNumber();
    bob_crystal = bob_crystal.toNumber();
    bob_gold_capacity = bob_gold_capacity.toNumber();
    bob_crystal_capacity = bob_crystal_capacity.toNumber();

    let [alice_units_ids, alice_units_quanities] = await userUnits.getUserUnitsAndQuantities.call(Alice);
    let [bob_units_ids, bob_units_quanities] = await userUnits.getUserUnitsAndQuantities.call(Bob);

    // alice_units_ids = alice_units_ids.map(id => id.toNumber());
    // alice_units_quanities = alice_units_quanities.map(q => q.toNumber());
    // bob_units_ids = bob_units_ids.map(id => id.toNumber());
    // bob_units_quanities = bob_units_quanities.map(q => q.toNumber());

    return {
      alice_gold,
      alice_crystal,
      bob_gold,
      bob_crystal,
      bob_gold_capacity,
      bob_crystal_capacity,
      alice_units_ids,
      alice_units_quanities,
      bob_units_ids,
      bob_units_quanities
    };
  },

};
