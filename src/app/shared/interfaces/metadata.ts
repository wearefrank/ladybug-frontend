import { DebugListItem } from './debug-list-item';

export interface MetaData extends DebugListItem {
  component: string;
  conversationId: string;
  endpointName: string;
  timestamp: string;

  // [key: string]: string | boolean;
}
