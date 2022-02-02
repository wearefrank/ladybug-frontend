import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { Metadata } from '../interfaces/metadata';

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

  sortData(sort: Sort, data: Metadata[]): any {
    if (!sort.active || sort.direction === '') {
      return;
    }
    data.sort((a, b) => {
      const isAsc: boolean = sort.direction === 'asc';
      switch (sort.active) {
        case '0':
          return this.compare(Number(a.duration), Number(b.duration), isAsc); // Duration
        case '1':
          return this.compare(Number(a.storageSize), Number(b.storageSize), isAsc); // StorageSize
        case '2':
          return this.compare(a.name, b.name, isAsc); // Name
        case '3':
          return this.compare(a.correlationId, b.correlationId, isAsc); // CorrelationId
        case '4':
          return this.compare(a.endTime, b.endTime, isAsc); // EndTime
        case '5':
          return this.compare(Number(a.storageId), Number(b.storageId), isAsc); // StorageId
        case '6':
          return this.compare(a.status, b.status, isAsc); // Status
        case '7':
          return this.compare(Number(a.numberOfCheckpoints), Number(b.numberOfCheckpoints), isAsc); // NumberOfCheckpoints
        case '8':
          return this.compare(Number(a.estimatedMemoryUsage), Number(b.estimatedMemoryUsage), isAsc); // EstimatedMemoryUsage
        default:
          return 0;
      }
    });
  }

  compare(a: number | string, b: number | string, isAsc: boolean): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
}
