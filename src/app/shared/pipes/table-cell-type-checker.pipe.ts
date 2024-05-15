import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tableCellTypeChecker',
  standalone: true,
})
export class tableCellTypeChecker implements PipeTransform {
  transform(value: string | boolean): string {
    let endValue: string = '';
    if (typeof value == 'string') {
      endValue = value;
    }
    if (typeof value == 'boolean') {
      endValue = value ? 'Enabled' : 'Disabled';
    }
    return endValue;
  }
}
