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
  storageId: number;
  stubStrategy: string;
  transformation: string;
  variableCsv: string;
  variablesAsMap: any; // Map<String, String>
  id: string; // Custom
}
