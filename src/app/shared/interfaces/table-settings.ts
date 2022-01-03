import { Metadata } from './metadata';

export interface TableSettings {
  tableId: string;
  reportMetadata: Metadata;
  displayAmount: number;
  showFilter: boolean;
  filterValue: string;
  tableLoaded: boolean;
}
