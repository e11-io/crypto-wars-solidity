import { PlayerResources } from "../resources/player-resources.model";
import { VillageInfo } from "../village/village-info.model";

export class BattleUnit {
  id: number;
  total: number;
  dead: number;
  percent: number;
  constructor(data: any = {}) {
    this.id = data.id;
    this.total = data.total;
    this.dead = data.dead;
    this.percent = Math.round((data.dead * 100) / data.total);
  }
}
export class BattleArmy {
  rate: number;
  flawlessAttacker: boolean;
  flawlessDefender: boolean;
  attacker: BattleUnit[];
  defender: BattleUnit[];
  constructor(data: any = {}) {
    this.rate = data.rate;
    this.attacker = data.attacker;
    this.defender = data.defender;
    this.flawlessAttacker = !data.attacker.length || data.attacker.map(unit => unit.dead).reduce((a,b) => a + b, 0) == 0;
    this.flawlessDefender = !data.defender.length || data.defender.map(unit => unit.dead).reduce((a,b) => a + b, 0) == 0;
  }
}
export class Casualties {
  attacker: {
    total: number,
    dead: number,
    percent: number,
    rate: number,
  };
  defender: {
    total: number,
    dead: number,
    percent: number,
    rate: number,
  };
  constructor(data: any = {}) {
    this.attacker = data.attacker;
    this.defender = data.defender;
  }
}
export class BattleResources {
  rate: number;
  defenderTotal: PlayerResources;
  defenderReward: PlayerResources;
  attackerReward: PlayerResources;
  constructor(data: any = {}) {
    this.rate = data.rate;
    this.defenderTotal = data.defenderTotal;
    this.defenderReward = data.defenderReward;
    this.attackerReward = data.attackerReward;
  }
}
export class BattleDetail {
  id: string;
  block: number;
  attacked: boolean;
  defended: boolean;
  village: VillageInfo;
  casualties: Casualties;
  army: BattleArmy;
  resources: BattleResources;
  constructor(data: any = {}) {
    this.id = data.id;
    this.block = data.block;
    this.attacked = data.attacked;
    this.defended = data.defended;
    this.village = data.village;
    this.casualties = data.casualties;
    this.army = data.army;
    this.resources = data.resources;
  }
}
