import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { PlayerResourcesState } from '../../../core/player/resources/player-resources.state';

import { Building } from '../../shared/models/building.model';
import { UnitMap } from '../../shared/models/unit.model';

@Component({
  selector: 'e11-village-info',
  templateUrl: './village-info.component.html',
  styleUrls: ['./village-info.component.scss']
})

export class VillageInfoComponent implements OnChanges {
  @Input() unitsMap: UnitMap = {};
  @Input() playerResources: PlayerResourcesState;
  @Input() ownedBuildings: Building[] = [];
  @Input() playerBalance: number;
  @Input() villageName: string;

  @Output() navigateTo: EventEmitter<string> = new EventEmitter<string>();


  unitsQuantity: number = 0;

  constructor(private router: Router) {}


  ngOnChanges(changes: SimpleChanges) {
    if (changes.unitsMap) {
      this.unitsQuantity = 0;
      Object.values(this.unitsMap).forEach(unit => {
        this.unitsQuantity += unit.quantity;
      })
    }
  }


}
