import { Injectable } from '@angular/core';
import { Metadata } from '../interfaces/metadata';
import { TreeNode } from '../interfaces/tree-node';
import { ReranReport } from '../interfaces/reran-report';
import { Report } from '../interfaces/report';
import { TableSettings } from '../interfaces/table-settings';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  // Table
  tables: TableSettings[] = [
    {
      tableId: 'debug',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: { fields: [], values: [] },
      displayAmount: -1,
      filterValue: '',
    },
    {
      tableId: 'leftId',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: { fields: [], values: [] },
      displayAmount: -1,
      filterValue: '',
    },
    {
      tableId: 'rightId',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: { fields: [], values: [] },
      displayAmount: -1,
      filterValue: '',
    },
  ];

  saveTableSettings(
    tableId: string,
    reportMetadata: Metadata,
    showFilter: boolean,
    displayAmount: number,
    filterValue: string,
    tableLoaded: boolean
  ): void {
    let currentTable: any = this.tables.find((table) => table.tableId === tableId);
    currentTable.reportMetadata = reportMetadata;
    currentTable.showFilter = showFilter;
    currentTable.displayAmount = displayAmount;
    currentTable.filterValue = filterValue;
    currentTable.tableLoaded = tableLoaded;
  }

  getTableSettings(tableId: string): TableSettings {
    return this.tables.find((table) => table.tableId === tableId)!;
  }

  // Tree
  treeLoaded: boolean = false;
  treeData: TreeNode[] = [];
  selectedReports: Report[] = [];
  selectedNode: number = -1;

  // Tests
  testLoaded: boolean = false;
  testReports: any[] = [];
  reranReports: ReranReport[] = [];

  // Ran tests
  // Selected reports in compare

  constructor() {}

  saveTestSettings(testReports: any[], reranReports: ReranReport[]): void {
    this.testLoaded = true;
    this.testReports = testReports;
    this.reranReports = reranReports;
  }

  getTestReports() {
    return this.testReports;
  }

  getReranReports(): ReranReport[] {
    return this.reranReports;
  }

  isTestLoaded(): boolean {
    return this.testLoaded;
  }

  saveTreeSettings(treeData: TreeNode[], selectedReports: Report[], nodeSelected: number): void {
    this.treeLoaded = true;
    this.treeData = treeData;
    this.selectedReports = selectedReports;
    this.selectedNode = nodeSelected;
  }

  isTreeLoaded(): boolean {
    return this.treeLoaded;
  }

  getTreeData(): any[] {
    return this.treeData;
  }

  getSelectedReports(): Report[] {
    return this.selectedReports;
  }

  getSelectedNode(): number {
    return this.selectedNode;
  }
}
