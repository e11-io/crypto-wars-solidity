export class PlayerResources {
  gold: number;
  crystal: number;
  quantum: number;
  constructor(data: any = {}) {
    this.gold = data.gold || 0;
    this.crystal = data.crystal || 0;
    this.quantum = data.quantum || 0;
  }
}
