import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'e11-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})

export class NewUserComponent {
  private email: string;
  private username: string;
  private villageName: string;

  @Input() step: string = 'userCreation';

  @Output() newApproveEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() newVillageEmitter: EventEmitter<any> = new EventEmitter<any>();


  constructor() {

  }

  tryAgain() {
    this.step = 'userCreation';
  }

  emitNewVillage() {
    let obj = {name: this.username, village: this.villageName, email: this.email};

    this.newVillageEmitter.emit(obj);
  }

}
