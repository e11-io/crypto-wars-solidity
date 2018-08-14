const fs = require('fs-extra');
const _ = require('lodash');
const commandLineArgs = require('command-line-args');

const optionDefinitions = [
  { name: 'src', alias: 's', type: String, defaultValue: './data/production/buildings' },
  { name: 'output', alias: 'o', type: String, defaultValue: './data/production' },
];

const options = commandLineArgs(optionDefinitions);

const stats = {
  "health": 0,
  "defense": 1,
  "attack": 2,
  "goldCapacity": 3,
  "crystalCapacity": 4,
  "goldRate": 5,
  "crystalRate": 6,
  "price": 7,
  "resource": 8,
  "blocks": 9,
  "previousLevelId": 10,
  "typeId": 11
};

const cleanName = (name) => {
  return name.toLowerCase().replace(/\s/g, '_');
}

const createBuildingOutputFromData = (data) => {
  let buildings = [];
  // Set the base stats for all levels
  let baseStats = [];
  const baseStatsKeys = Object.keys(data.baseStats)
  for (let bs_index = 0; bs_index < baseStatsKeys.length; bs_index++) {
    const stat = baseStatsKeys[bs_index];
    const indexOnStats = stats[stat]
    baseStats[indexOnStats] = data.baseStats[stat];
  }
  // Create information for all levels
  for (let level = 1 ; level <= data.maxLevel; level++) {
    let building = {
      id: `${level}00${data.typeId}`,
      name: `${cleanName(data.name)}_${level}`,
      stats: _.clone(baseStats)
    };
    // Get the stats that should be modify
    const statsToModify = Object.keys(data.modifiers);
    for (let k = 0; k < statsToModify.length; k++) {
      const stat = statsToModify[k]; // name of stat
      const indexOnStats = stats[stat]; // index of the stat on stats array
      const BL = level; // BL = Building level
      const BV = baseStats[indexOnStats]; // BV = Base value
      const newValue = eval(data.modifiers[stat]); // Modify it
      building.stats[indexOnStats] = Math.round(newValue);
    }
    building.requirements = (data.levelsRequirements[level]) ? data.levelsRequirements[level] : [];
    building.stats[10] = (level === 1) ? 0 : parseInt(`${level - 1}00${data.typeId}`) // Set Previous level ID
    building.stats[11] = data.typeId; // Set type id
    buildings.push(building);
  }
  console.log('Exported', data.name);
  return buildings;
}

const resolveRequirementsDependencies = (buildings) => {
  for (let i = 0; i < buildings.length; i ++) {
    for (let j = 0; j < buildings[i].requirements.length; j++) {
      const building = buildings.find(building => building.name === buildings[i].requirements[j]);
      buildings[i].requirements[j] = building.id;
    }
  }
  return buildings;
}

const generateOutput = async () => {
  let output = {
    buildingProperties: {
      id: '0',
      name: '0',
      stats: Object.keys(stats)
    },
    stats,
    initialBuildings: [],
  };
  const fileNames = await fs.readdir(`${options.src}`);
  for (let i = 0; i < fileNames.length; i ++) {
    const buildingData = await fs.readJsonSync(`${options.src}/${fileNames[i]}`);
    const buildingOutput = createBuildingOutputFromData(buildingData);
    output.initialBuildings = output.initialBuildings.concat(buildingOutput);
  }
  // Should resolve requirements after adding all buildings
  output.initialBuildings = resolveRequirementsDependencies(output.initialBuildings);
  await fs.writeJson(`${options.output}/buildings.json`, output, { spaces: 2 });
}

generateOutput();
