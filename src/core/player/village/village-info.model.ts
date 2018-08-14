export class VillageInfo {
  address: string;
  username: string;
  villageName: string;
  unitsIds: number[];
  unitsQuantities: number[];
  battleStats: number[];
  resources: number[];
  canAttack: boolean;
  canTakeRevenge: boolean;

  constructor(data: any = {}) {
    this.address = data.address;
    this.username = data.username;
    this.villageName = data.villageName;
    this.unitsIds = data.unitsIds || [];
    this.unitsQuantities = data.unitsQuantities || [];
    this.battleStats = data.battleStats || [];
    this.resources = data.resources || [];
    this.canAttack = data.canAttack;
    this.canTakeRevenge = data.canTakeRevenge;
  }
}
