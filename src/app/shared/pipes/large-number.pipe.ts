import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'largeNumber'
})
export class LargeNumberPipe implements PipeTransform {

  transform(input: any, digits: number = 2, maxDigits: number = 3): any {
    var exp, rounded,
      suffixes = ['k', 'M', 'G', 'T', 'P', 'E'];

    if (Number.isNaN(input) || input == undefined) {
      return null;
    }

    if (input < 1000) {
      return input;
    }

    exp = Math.floor(Math.log(input) / Math.log(1000));
    let number = parseFloat((input / Math.pow(1000, exp)).toFixed(digits));
    let extraDigits = number.toString().replace('.','').length - maxDigits;
    if (extraDigits > 0) {
        return parseFloat(number.toFixed(digits - extraDigits)) + suffixes[exp - 1];
    }
    return number + suffixes[exp - 1];
  }

}
