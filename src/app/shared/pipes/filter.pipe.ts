import { Pipe, PipeTransform } from '@angular/core';
import { Metadata } from '../interfaces/metadata';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  /**
   * Filter all values in this column (items) based on filter
   * @param items - the column to be filtered
   * @param header
   * @param filter - the word with which to filter
   */
  transform(items: Metadata[], filter: string, header: string): Metadata[] {
    if (!items || !filter || filter === '') {
      return items;
    }

    // @ts-ignore
    return items.filter((item) => {
      switch (header) {
        case 'Storage Id':
          return item.storageId.includes(filter);
        case 'End Time':
          return item.endTime.includes(filter);
        case 'Duration (ms)':
          return item.duration.includes(filter);
        case 'Name':
          return item.name.includes(filter);
        case 'Status':
          return item.status.includes(filter);
        case 'Correlation id':
          return item.correlationId.includes(filter);
        case 'Number of Checkpoints':
          return item.numberOfCheckpoints.includes(filter);
        case 'Estimated Memory Usage (Bytes)':
          return item.estimatedMemoryUsage.includes(filter);
        case 'Storage Size (Bytes)':
          return item.storageSize.includes(filter);
      }
    });
  }
}
