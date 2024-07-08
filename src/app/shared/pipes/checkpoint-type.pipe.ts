import { Pipe, PipeTransform } from '@angular/core';
import { CHECKPOINT_TYPE_STRINGS, CheckpointType } from '../enums/checkpoint-type';

@Pipe({
  name: 'checkpointType',
  standalone: true,
})
export class CheckpointTypePipe implements PipeTransform {
  transform(type: CheckpointType): string {
    return CHECKPOINT_TYPE_STRINGS[type];
  }
}
