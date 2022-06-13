export interface Metadata {
  storageId: string;
  endTime: string;
  duration: string;
  name: string;
  correlationId: string;
  status: string;
  numberOfCheckpoints: string;
  estimatedMemoryUsage: string;
  storageSize: string;
  checked?: boolean;
  variables: any;
}
