import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  THROWABLE_ENCODER = 'printStackTrace()';
  constructor() {}

  getImage(type: number, encoding: string, even: boolean): string {
    let img = 'assets/tree-icons/';
    switch (type) {
      case 1:
        img += 'start';
        break;
      case 2:
        img += 'end';
        break;
      case 3:
        img += 'abort';
        break;
      case 4:
        img += 'input';
        break;
      case 5:
        img += 'output';
        break;
      case 6:
        img += 'info';
        break;
      case 7:
        img += 'threadCreate'; // Doesn't exist?
        break;
      case 8:
        img += 'threadStart';
        break;
      case 9:
        img += 'threadEnd';
        break;
      default:
        return '';
    }
    img += 'point';

    if (encoding === this.THROWABLE_ENCODER) {
      img += '-error';
    }

    if (even) {
      return img + '-even.gif';
    }
    return img + '-odd.gif';
  }

  sortData(sort: Sort, data: string[][]): any {
    if (!sort.active || sort.direction === '') {
      return;
    }
    data.sort((a, b) => {
      const isAsc: boolean = sort.direction === 'asc';
      switch (sort.active) {
        case '0':
          return this.compare(Number(a[0]), Number(b[0]), isAsc); // Duration
        case '1':
          return this.compare(Number(a[1]), Number(b[1]), isAsc); // StorageSize
        case '2':
          return this.compare(a[2], b[2], isAsc); // Name
        case '3':
          return this.compare(a[3], b[3], isAsc); // CorrelationId
        case '4':
          return this.compare(a[4], b[4], isAsc); // EndTime
        case '5':
          return this.compare(Number(a[5]), Number(b[5]), isAsc); // StorageId
        case '6':
          return this.compare(a[6], b[6], isAsc); // Status
        case '7':
          return this.compare(Number(a[7]), Number(b[7]), isAsc); // NumberOfCheckpoints
        case '8':
          return this.compare(Number(a[8]), Number(b[8]), isAsc); // EstimatedMemoryUsage
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
