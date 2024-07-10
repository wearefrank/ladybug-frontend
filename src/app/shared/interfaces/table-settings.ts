export interface TableSettings {
  reportMetadata: any[];
  displayAmount: number;
  showFilter: boolean;
  filterHeaders: string[];
  filterValues: string[];
  tableLoaded: boolean;
  numberOfReportsInProgress: number;
  estimatedMemoryUsage: string;
  uniqueValues: Map<string, Array<string>>;
}
