export interface TableSettings {
  reportMetadata: any[];
  metadataHeaders: any[];
  displayAmount: number;
  showFilter: boolean;
  filterValue: string;
  tableLoaded: boolean;
  filterHeader: string;
  reportsInProgress: number;
  estimatedMemoryUsage: string;
  uniqueValues: Map<string, Array<string>>;
}
