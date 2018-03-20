import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'e11-village-queues',
  templateUrl: './village-queues.component.html',
  styleUrls: ['./village-queues.component.scss']
})

export class VillageQueuesComponent implements OnChanges {
  @Input() buildingsQueue: any = [];
  @Input() barracksQueue: any = [];
  @Input() researchQueue: any = [];

  @Output() goToBuildings: EventEmitter<any> = new EventEmitter<any>();

  private maxQueueItems: number = 4;
  public buildingsQueueIsEmpty: boolean = true;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.buildingsQueue) {
      this.setUnfinishedBuildings(changes.buildingsQueue.currentValue);
    }
  }

  setUnfinishedBuildings(buildings: any) {
    let unfinishedBuildings = buildings.filter(building => building.inProgress);
    this.buildingsQueueIsEmpty = unfinishedBuildings.length ? false : true;
  }

  trackByFn(index, item) {
    return item.id;
  }

}
