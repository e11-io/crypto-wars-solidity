import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Building } from "../../../core/buildings/building.model";

@Component({
  selector: 'e11-queue-navbar',
  templateUrl: './queue-navbar.component.html',
  styleUrls: ['./queue-navbar.component.scss']
})

export class QueueNavbarComponent implements OnInit {
  @Input() remainingBlocks: number = 0;
  @Input() queueType: string;
  @Input() itemsInQueue: Building[] = [];

  @Output() itemClicked: EventEmitter<any> = new EventEmitter<any>();

  private imagePathUrl: string = '/assets/img/';

  constructor() {
  }

  ngOnInit() {
    this.imagePathUrl += this.queueType + '/thumbnails/';
  }

  trackByFn(index, item) {
    return item.id;
  }

  onItemClick(item: any) {
    if (!item || !item.inProgress) {
      return;
    }
    this.itemClicked.emit(item);
  }
}
