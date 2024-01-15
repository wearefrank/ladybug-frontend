import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tableCellShortener',
  standalone: true,
})
export class TableCellShortenerPipe implements PipeTransform {
  transform(value: string): string {
    if (value == undefined) {
      return value;
    }
    if (
      value.match('\\b\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d{3}\\b')
    ) {
      return value.substring(0, value.indexOf('.'));
    }
    if (value.length > 32) {
      return value.substring(0, 32) + '...';
    }
    return value;
  }
}
