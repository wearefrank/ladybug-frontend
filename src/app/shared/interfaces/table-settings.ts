import { MetaData } from './metadata';
import { Report } from './report';

export interface TableSettings {
  reportMetadata: MetaData[];
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
