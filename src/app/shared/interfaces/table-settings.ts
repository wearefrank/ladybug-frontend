import { DebugListItem } from './debug-list-item';
import { MetaData } from './metadata';
import { Report } from './report';

export interface TableSettings {
  reportMetadata: DebugListItem[];
  metadataHeaders: Report[];
  displayAmount: number;
  showFilter: boolean;
  filterValue: string;
  tableLoaded: boolean;
  filterHeader: string;
  numberOfReportsInProgress: number;
  estimatedMemoryUsage: string;
  uniqueValues: Map<string, Array<string>>;
}
