export interface Report {
  checkpoints: Report[];
  correlationId: string;
  description: string;
  endTime: number;
  estimatedMemoryUsage: number;
  fullPath: string;
  inputCheckpoint: Report;
  name: string;
  numberOfCheckpoints: number;
  originalEndpointOrAbortpointForCurrentLevel: any // I dont know the type
  originalReport: Report;
  path: string;
  reportFilterMatching: boolean;
  startTime: number;
  storageId: number;
  stubStrategy: string;
  transformation: string;
  variableCsv: any // I dont know the type
  variablesAsMap: any // I dont know the type
}
