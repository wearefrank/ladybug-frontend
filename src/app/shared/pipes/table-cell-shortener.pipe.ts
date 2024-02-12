import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { SettingsService } from '../services/settings.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'tableCellShortener',
  standalone: true,
})
export class TableCellShortenerPipe implements PipeTransform {
  transform(value: string): string {
    if (value == undefined) {
      return value;
    }
    //Remove milliseconds if value is a timestamp with milliseconds
    if (value.match('\\b\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}\\.\\d{3}\\b')) {
      return value.slice(0, Math.max(0, value.indexOf('.')));
    }
    return value;
  }
}
