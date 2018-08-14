import { Status, initialStatus } from '../../shared/status.model';
import { PlayerBattle } from './player-battle.model';
import { BattleDetail } from './battle-detail.model';

export interface PlayerBattleState {
  expandedBattleDetail:   string;
  attackCooldown:         number;
  lastAttackBlock:        number;
  rewardAttackerModifier: number;
  rewardDefenderModifier: number;
  status:                 Status;
  oldestBlock:            number;
  currentBlock:           number;
  battles:                BattleDetail[];
  searchThreshold:        number;
  limitThreshold:         number;
}

export const initialPlayerBattleState: PlayerBattleState = {
  expandedBattleDetail:   null,
  attackCooldown:         0,
  lastAttackBlock:        0,
  rewardAttackerModifier: 0,
  rewardDefenderModifier: 0,
  status:                 initialStatus,
  oldestBlock:            null,
  currentBlock:           null,
  battles:                [],
  searchThreshold:        10000,
  limitThreshold:         50000,
};
