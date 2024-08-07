import { CheckpointType } from '../enums/checkpoint-type';

export interface Checkpoint {
  encoding?: string;
  estimatedMemoryUsage: number;
  index: number;
  level: number;
  message: string;
  messageClassName?: string;
  name: string;
  noCloseReceivedForStream?: boolean;
  preTruncatedMessageLength: number;
  sourceClassName?: number;
  showConverted?: boolean;
  streaming?: string;
  stub: number;
  stubNotFound?: string;
  stubbed: boolean;
  threadName: string;
  type: CheckpointType;
  typeAsString: string;
  uid: string;
  waitingForStream: boolean;
  storageId?: number;
  checkpoints?: Checkpoint[];
  icon?: string;
  iconClass?: string;
}
