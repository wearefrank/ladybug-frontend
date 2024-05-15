export interface DebugVariables {
  correlationId?: string;
  duration?: string;
  endTime?: string;
  estimatedMemoryUsage?: string;
  name?: string;
  numberOfCheckpoints?: string;
  status?: string;
  storageId?: string;
  storageSize?: string;
  component?: string;
  conversationId?: string;
  endpointName?: string;
  timestamp?: string;

  [key: string]: string | undefined;
}
