import { Pipe, PipeTransform } from '@angular/core';
import { CHECKPOINT_TYPE_STRINGS, CheckpointType } from '../enums/checkpoint-type';
import { IconData } from '../interfaces/icon-data';

@Pipe({
  name: 'checkpointType',
  standalone: true,
})
export class CheckpointTypePipe implements PipeTransform {
  transform(type: CheckpointType): IconData {
    return CHECKPOINT_TYPE_STRINGS[type];
  }
}
