import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'e11-village-queues',
  templateUrl: './village-queues.component.html',
  styleUrls: ['./village-queues.component.scss']
})

export class VillageQueuesComponent implements OnChanges {
  @Input() buildingsQueue: any = [];
  @Input() researchQueue: any = [];
  @Input() unitsQueue: any = [];

  @Output() navigateTo: EventEmitter<string> = new EventEmitter<string>();

  public buildingsQueueIsEmpty: boolean = true;
  public unitsQueueIsEmpty: boolean = true;
  private maxQueueItems: number = 4;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buildingsQueue) {
      this.setUnfinishedBuildings(changes.buildingsQueue.currentValue);
    }

    if (changes.unitsQueue) {
      this.setUnfinishedUnits(changes.unitsQueue.currentValue);
    }
  }

  setUnfinishedBuildings(buildings: any) {
    let unfinishedBuildings = buildings.filter(building => building.inProgress);
    this.buildingsQueueIsEmpty = unfinishedBuildings.length ? false : true;
  }

  setUnfinishedUnits(units: any) {
    let unfinishedUnits = units.filter(unit => unit.inProgress);
    this.unitsQueueIsEmpty = unfinishedUnits.length ? false : true;
  }

  trackByFn(index, item) {
    return item.id;
  }

}
