import { Checkpoint } from './checkpoint';
import { BaseReport } from './base-report';

export interface Report extends BaseReport {
  checkpoints: Checkpoint[];
  correlationId: string;
  crudStorage: boolean;
  endTime: number;
  estimatedMemoryUsage: number;
  fullPath: string;
  inputCheckpoint: Checkpoint;
  numberOfCheckpoints: number;
  originalEndpointOrAbortpointForCurrentLevel?: Checkpoint;
  originalReport: Report;
  reportFilterMatching: boolean;
  startTime: number;
  stub: number;
  stubStrategy: string;
  transformation: string;
  variableCsv: string;
  storageName: string;
  variablesAsMap: any; // Map<String, String>
  xml: string; // Custom for the xml representation of the report
  id: string; // Custom
}
