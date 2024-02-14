import { Pipe, PipeTransform } from '@angular/core';
import { HelperService } from '../services/helper.service';

@Pipe({
  name: 'checkpointType',
  standalone: true,
})
export class CheckpointTypePipe implements PipeTransform {
  constructor(private helperService: HelperService) {}
  transform(type: number): string {
    return this.helperService.getCheckpointType(type);
  }
}
