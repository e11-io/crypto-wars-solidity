import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'e11-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnChanges {
    @Input() activeAccount: string;
    @Input() activeSection: any;
    @Input() balance: any;
    @Input() childNavDisabled: boolean = false;
    @Input() ethBalance: any;
    @Input() playerResources: any;

    blockiesOptions: any = {size: 8, scale: 6};
    constructor() {

    }

    ngOnChanges(changes: SimpleChanges) {
      if(changes.activeAccount && changes.activeAccount.currentValue !== changes.activeAccount.previousValue) {
        this.activeAccount = changes.activeAccount.currentValue;
        this.blockiesOptions = Object.assign({}, this.blockiesOptions, {seed: this.activeAccount.toLowerCase()});
      }
  }
}
