import { PlayerUnit } from '../assets/units/player-unit.model';

// TODO: Change PlayerUnit to UserUnit

export class PlayerBattle {
  attacker: string;
  defender: string;

  attackerUnits: PlayerUnit[];
  attackerDeadUnits: PlayerUnit[];
  defenderUnits: PlayerUnit[];
  defenderDeadUnits: PlayerUnit[];

  attackerRewards: number[];
  defenderRewards: number[];

  constructor(data: any = {}) {
	  this.attacker = data.attacker;
	  this.defender = data.defender;

    this.attackerUnits = data.attackerUnits;
	  this.attackerDeadUnits = data.attackerDeadUnits;

	  this.defenderUnits = data.defenderUnits;
	  this.defenderDeadUnits = data.defenderDeadUnits;

    this.attackerRewards = data.attackerRewards;
    this.defenderRewards = data.defenderRewards;
  }
}
