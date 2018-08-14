import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'blockTime'
})
export class BlockTimePipe implements PipeTransform {

  transform(blocks: any, args?: any): any {
    if (!blocks) {
      blocks = 0;
      if (args == 'hh') {
        return '(00:00)';
      } else {
        return '0s';
      }
    }

    let blockSeconds = blocks * environment.blockTime;
    let time = new Date(blockSeconds * 1000);

    if (args == 'hh') {
      return time.toISOString().substr(11, 8);
    } else {
      let months = Number(time.toISOString().substr(5, 2)) - 1;
      let days = Number(time.toISOString().substr(8, 2)) - 1;
      let hours = Number(time.toISOString().substr(11, 2));
      let minutes = Number(time.toISOString().substr(14, 2));
      let seconds = Number(time.toISOString().substr(17, 2));

      return (months ? months + 'm' : '') +
             (days ? days + 'd' : '') +
             (!months && hours ? hours + 'h' : '') +
             (!months && !days && minutes ? minutes + 'm' : '') +
             (!months && !days && !hours && seconds ? seconds + 's' : '');
    }
  }

}
