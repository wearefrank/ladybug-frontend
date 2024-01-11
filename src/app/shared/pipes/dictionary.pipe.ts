import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Pipe({
  name: 'dictionary',
})
export class DictionaryPipe implements PipeTransform {
  transform(value: Map<string, string>): Array<KeyValue<string, string>> | null {
    const keyValues: Array<KeyValue<any, any>> = [];
    for (let entry of value.entries()) {
      keyValues.push({ key: entry[0], value: entry[1] });
    }
    return keyValues;
  }
}
