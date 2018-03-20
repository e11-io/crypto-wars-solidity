import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'e11-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
    @Input() error: string;

    constructor() {

    }

    openGuide() {
      window.open('https://blog.e11.io/cryptowars-alpha-release-troubleshooting-guide-f4e21cd5c992', '_blank');
    }
}
