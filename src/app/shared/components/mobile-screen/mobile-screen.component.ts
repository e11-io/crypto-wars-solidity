import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'e11-mobile-screen',
  templateUrl: './mobile-screen.component.html',
  styleUrls: ['./mobile-screen.component.scss']
})
export class MobileScreenComponent {

    constructor() {

    }
}
