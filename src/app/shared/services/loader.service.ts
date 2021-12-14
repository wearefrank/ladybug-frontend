import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  // Table
  tableLoaded: boolean = false;
  tableData: any = {}
  showFilter: boolean = false;

  // Tree
  treeLoaded: boolean = false;
  treeData: any[] = [];
  selectedNode: number = -1;

  // Tests
  testLoaded: boolean = false;
  testReports: any[] = [];
  reranReports: any[] = [];

  // Ran tests
  // Selected reports in compare

  constructor() { }

  saveTestSettings(testReports: any[], reranReports: any[]): void {
    this.testLoaded = true;
    this.testReports = testReports;
    this.reranReports = reranReports;
  }

  getTestReports() {
    return this.testReports;
  }

  getReranReports(): any[] {
    return this.reranReports;
  }

  isTestLoaded(): boolean {
    return this.testLoaded;
  }

  saveTableSettings(tableData: any, showFilter: boolean): void {
    this.tableLoaded = true;
    this.tableData = tableData;
    this.showFilter = showFilter;
  }

  isTableLoaded(): boolean {
    return this.tableLoaded;
  }

  getTableData(): any {
    return this.tableData;
  }

  getShowFilter(): boolean {
    return this.showFilter;
  }

  saveTreeSettings(treeData: any[], nodeSelected: number): void {
    this.treeLoaded = true;
    this.treeData = treeData;
    this.selectedNode = nodeSelected;
  }

  isTreeLoaded(): boolean {
    return this.treeLoaded;
  }

  getTreeData(): any[] {
    return this.treeData;
  }

  getSelectedNode(): number {
    return this.selectedNode;
  }
}
