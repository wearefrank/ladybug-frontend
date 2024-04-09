export interface TableSettings {
  reportMetadata: any[];
  metadataHeaders: any[];
  displayAmount: number;
  showFilter: boolean;
  filterHeader: string;
  filterValue: string;
  tableLoaded: boolean;
  numberOfReportsInProgress: number;
  estimatedMemoryUsage: string;
  uniqueValues: Map<string, Array<string>>;
}
