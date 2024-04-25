export interface MetaData {
  checked: boolean;
  correlationId: string;
  duration: string;
  endTime: string;
  estimatedMemoryUsage: string;
  name: string;
  numberOfCheckpoints: string;
  status: string;
  storageId: string;
  storageSize: string;

  COMPONENT: string;
  'CONVERSATION ID': string;
  'CORRELATION ID': string;
  'ENDPOINT NAME': string;
  'NR OF CHECKPOINTS': string;
  STATUS: string;
  TIMESTAMP: string;

  [key: string]: string | boolean;
}
