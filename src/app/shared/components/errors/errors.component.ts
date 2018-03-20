import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'e11-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.scss']
})
export class ErrorsComponent {
    @Input() error: string;

    constructor() {

    }

    installMetamask() {
      window.open('https://metamask.io/', '_blank');
    }

    openGuide() {
      window.open('https://blog.e11.io/cryptowars-alpha-release-troubleshooting-guide-f4e21cd5c992', '_blank');
    }
}
