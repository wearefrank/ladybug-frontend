export interface TableSettings {
  tableId: string;
  reportMetadata: any[];
  displayAmount: number;
  showFilter: boolean;
  filterValue: string;
  tableLoaded: boolean;
  filterHeader: string;
  reportsInProgress: number;
  estimatedMemoryUsage: string;
}
