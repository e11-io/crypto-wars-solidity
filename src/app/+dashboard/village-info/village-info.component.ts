import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'e11-village-info',
  templateUrl: './village-info.component.html',
  styleUrls: ['./village-info.component.scss']
})

export class VillageInfoComponent {
  @Input() villageName: string;
  @Input() userResources: any;
  @Input() userBuildings: any = [];
  @Input() userBalance: number;

  @Output() goToBuildings: EventEmitter<any> = new EventEmitter<any>();

  constructor(private router: Router) {}

}
