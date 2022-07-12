import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumToArray',
})
export class EnumToArrayPipe implements PipeTransform {
  transform(data: any) {
    delete data.checked;
    return Object.values(data);
  }
}
