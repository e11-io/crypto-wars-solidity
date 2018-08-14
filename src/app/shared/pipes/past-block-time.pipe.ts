import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'pastBlockTime'
})
export class PastBlockTimePipe implements PipeTransform {

  transform(block: any): any {
    if (!block || block <= 0) {
      return 'now';
    }

    let blockSeconds = block * environment.blockTime;
    let time = new Date(blockSeconds * 1000);

    let months = Number(time.toISOString().substr(5, 2)) - 1;
    let days = Number(time.toISOString().substr(8, 2)) - 1;
    let hours = Number(time.toISOString().substr(11, 2));
    let minutes = Number(time.toISOString().substr(14, 2));
    let seconds = Number(time.toISOString().substr(17, 2));

    if (months < 12) {
      if (months < 1) {
        if (days < 1) {
          if (hours < 1) {
            if (minutes < 1) {
              return 'now';
            } else {
              return minutes + 'm';
            }
          } else {
            return hours + 'h';
          }
        } else {
          return days + 'd';
        }
      } else {
        return months + 'mo';
      }
    } else {
      let years = months / 12;
      return years + 'y';
    }

  }
}
