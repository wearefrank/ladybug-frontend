import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Pipe({
  name: 'dictionary',
})
export class DictionaryPipe implements PipeTransform {
  transform(dict: Map<string, string>): Array<KeyValue<string, string>> | null {
    const keyValues: Array<KeyValue<any, any>> = [];
    for (let [key, value] of dict.entries()) {
      keyValues.push({ key: key, value: value });
    }
    return keyValues;
  }
}
