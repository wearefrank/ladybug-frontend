import { Pipe, PipeTransform } from '@angular/core';

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
  transform(items: any[], filter: string, header: string): any[] {
    if (!items || !filter || filter === '') {
      return items;
    }

    // TODO: Make this dynamic
    // @ts-ignore
    return items.filter((item) => {
      switch (header) {
        case 'storageId':
          return item.storageId.includes(filter);
        case 'endTime':
          return item.endTime.includes(filter);
        case 'duration':
          return item.duration.includes(filter);
        case 'name':
          return item.name.includes(filter);
        case 'status':
          return item.status.includes(filter);
        case 'correlationId':
          return item.correlationId.includes(filter);
        case 'numberOfCheckpoints':
          return item.numberOfCheckpoints.includes(filter);
        case 'estimatedMemoryUsage':
          return item.estimatedMemoryUsage.includes(filter);
        case 'storageSize':
          return item.storageSize.includes(filter);
      }
    });
  }
}
