import { Checkpoint } from './checkpoint';
import { ReportStubStrategy } from '../enums/stub-strategy';

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
  originalEndpointOrAbortpointForCurrentLevel?: Checkpoint;
  originalReport: Report;
  path: string;
  reportFilterMatching: boolean;
  startTime: number;
  storageId: number;
  stub: number;
  stubStrategy: ReportStubStrategy;
  transformation: string;
  variableCsv: string;
  checked: boolean;
  storageName?: string;
  variablesAsMap: any; // Map<String, String>
  xml: string; // Custom for the xml representation of the report
  id: string; // Custom
}
