import { Checkpoint } from './checkpoint';

export interface Report {
  checkpoints: Checkpoint[];
  correlationId: string;
  description: string;
  endTime: number;
  estimatedMemoryUsage: number;
  fullPath: string;
  inputCheckpoint: Checkpoint;
  name: string;
  numberOfCheckpoints: number;
  originalEndpointOrAbortpointForCurrentLevel: Checkpoint;
  originalReport: Report;
  path: string;
  reportFilterMatching: boolean;
  startTime: number;
  storageId: string;
  stubStrategy: string;
  transformation: string;
  variableCsv: string;

  checked: boolean;
  stub: number;
  uid: string;
  encoding: string;
  message: string;
  stubbed: boolean;
  messageClassName: string;
  waitingForStream: boolean;
  streaming: string;
  noCloseReceivedForStream: boolean;
  showConverted: boolean;
  preTruncatedMessageLength: number;
  stubNotFound: boolean;

  storageName: string;
  variablesAsMap: any; // Map<String, String>
  xml: string; // Custom for the xml representation of the report
  id: string; // Custom
}
