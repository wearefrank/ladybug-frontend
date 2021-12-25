import { Injectable } from '@angular/core';
import { Metadata } from '../interfaces/metadata';
import { TreeNode } from '../interfaces/tree-node';
import { ReranReport } from '../interfaces/reran-report';
import { Report } from '../interfaces/report';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  // Table
  tableLoaded: boolean = false;
  tableData: Metadata = { fields: [], values: [] };
  showFilter: boolean = false;

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

  saveTableSettings(tableData: Metadata, showFilter: boolean): void {
    this.tableLoaded = true;
    this.tableData = tableData;
    this.showFilter = showFilter;
  }

  isTableLoaded(): boolean {
    return this.tableLoaded;
  }

  getTableData(): Metadata {
    return this.tableData;
  }

  getShowFilter(): boolean {
    return this.showFilter;
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
