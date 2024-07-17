import { CheckpointType } from '../enums/checkpoint-type';
import { IconData } from './icon-data';

export interface Checkpoint {
  encoding: string;
  estimatedMemoryUsage: number;
  index: number;
  level: number;
  message: string;
  messageClassName: string;
  name: string;
  preTruncatedMessageLength: number;
  sourceClassName: number;
  streaming: string;
  stub: number;
  stubNotFound: string;
  stubbed: boolean;
  threadName: string;
  type: CheckpointType;
  typeAsString: string;
  uid: string;
  waitingForStream: boolean;
  storageId?: string;
  checkpoints?: Checkpoint[];
  icon: string;
  iconClass?: string;
}
