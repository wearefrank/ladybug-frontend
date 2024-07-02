import { Checkpoint } from './checkpoint';

export interface Report {
  checkpoints: Checkpoint[];
  correlationId: string;
  status: string;
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

  storageName: string;
  variablesAsMap: any; // Map<String, String>
  xml: string; // Custom for the xml representation of the report
  id: string; // Custom
}
