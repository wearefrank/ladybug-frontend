import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'enumToArray',
})
export class EnumToArrayPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(data: any) {
    if (Object.keys(data).includes('endTime')) {
      data['endTime'] = this.datePipe.transform(data['endTime'], 'dd/MM/yyyy - HH:mm:ss.SSS');
    }
    return Object.values(data);
  }
}
