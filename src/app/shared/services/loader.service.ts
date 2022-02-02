import { Injectable } from '@angular/core';
import { Metadata } from '../interfaces/metadata';
import { TreeNode } from '../interfaces/tree-node';
import { ReranReport } from '../interfaces/reran-report';
import { Report } from '../interfaces/report';
import { TableSettings } from '../interfaces/table-settings';
import { TreeSettings } from '../interfaces/tree-settings';
import { TestTreeNode } from '../interfaces/test-tree-node';

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
      reportMetadata: [],
      displayAmount: -1,
      filterValue: '',
      filterHeader: '',
    },
    {
      tableId: 'leftId',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: [],
      displayAmount: -1,
      filterValue: '',
      filterHeader: '',
    },
    {
      tableId: 'rightId',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: [],
      displayAmount: -1,
      filterValue: '',
      filterHeader: '',
    },
  ];

  saveTableSettings(
    tableId: string,
    reportMetadata: Metadata[],
    showFilter: boolean,
    displayAmount: number,
    filterValue: string,
    tableLoaded: boolean,
    filterHeader: string
  ): void {
    let currentTable: TableSettings = this.tables.find((table) => table.tableId === tableId)!;
    currentTable.reportMetadata = reportMetadata;
    currentTable.showFilter = showFilter;
    currentTable.displayAmount = displayAmount;
    currentTable.filterValue = filterValue;
    currentTable.tableLoaded = tableLoaded;
    currentTable.filterHeader = filterHeader;
  }

  getTableSettings(tableId: string): TableSettings {
    return this.tables.find((table) => table.tableId === tableId)!;
  }

  // Tree
  trees: TreeSettings[] = [
    {
      treeId: 'debug',
      treeLoaded: false,
      tree: [],
      selectedReports: [],
      selectedNode: -1,
    },
    {
      treeId: 'leftId',
      treeLoaded: false,
      tree: [],
      selectedReports: [],
      selectedNode: -1,
    },
    {
      treeId: 'rightId',
      treeLoaded: false,
      tree: [],
      selectedReports: [],
      selectedNode: -1,
    },
  ];

  saveTreeSettings(
    treeId: string,
    treeLoaded: boolean,
    tree: TreeNode[],
    selectedReports: Report[],
    selectedNode: number
  ): void {
    let currentTree: TreeSettings = this.trees.find((tree) => tree.treeId === treeId)!;
    currentTree.treeLoaded = treeLoaded;
    currentTree.tree = tree;
    currentTree.selectedReports = selectedReports;
    currentTree.selectedNode = selectedNode;
  }

  getTreeSettings(treeId: string): TreeSettings {
    return this.trees.find((tree) => tree.treeId === treeId)!;
  }

  // Tests
  testLoaded: boolean = false;
  testReports: any[] = [];
  reranReports: ReranReport[] = [];
  folderFilter: string = '';

  constructor() {}

  saveTestSettings(testReports: any[], reranReports: ReranReport[], folderFilter: string): void {
    this.testLoaded = true;
    this.testReports = testReports;
    this.reranReports = reranReports;
    this.folderFilter = folderFilter;
  }

  getTestReports() {
    return this.testReports;
  }

  getReranReports(): ReranReport[] {
    return this.reranReports;
  }

  getFolderFilter() {
    return this.folderFilter;
  }

  isTestLoaded(): boolean {
    return this.testLoaded;
  }

  testTreeSettings: any = {
    baseFolder: {},
    currentFolder: {},
    testTreeLoaded: false,
  };

  saveTestTreeSettings(baseFolder: TestTreeNode, currentFolder: any) {
    this.testTreeSettings.testTreeLoaded = true;
    this.testTreeSettings.baseFolder = baseFolder;
    this.testTreeSettings.currentFolder = currentFolder;
  }

  getTestBaseFolder(): TestTreeNode {
    return this.testTreeSettings.baseFolder;
  }

  getTestCurrentFolder(): any {
    return this.testTreeSettings.currentFolder;
  }

  isTestTreeLoaded(): boolean {
    return this.testTreeSettings.testTreeLoaded;
  }
}
