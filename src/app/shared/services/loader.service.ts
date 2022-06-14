import { Injectable } from '@angular/core';
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
      reportsInProgress: '',
      estimatedMemoryUsage: '',
    },
    {
      tableId: 'leftId',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: [],
      displayAmount: -1,
      filterValue: '',
      filterHeader: '',
      reportsInProgress: '',
      estimatedMemoryUsage: '',
    },
    {
      tableId: 'rightId',
      tableLoaded: false,
      showFilter: false,
      reportMetadata: [],
      displayAmount: -1,
      filterValue: '',
      filterHeader: '',
      reportsInProgress: '',
      estimatedMemoryUsage: '',
    },
  ];

  saveTableSettings(tableId: string, tableSettings: TableSettings): void {
    let tableIndex: number = this.tables.findIndex((table) => table.tableId === tableId)!;
    this.tables[tableIndex] = tableSettings;
    this.tables[tableIndex].tableId = tableId;
  }

  getTableSettings(tableId: string): TableSettings {
    return this.tables.find((table) => table.tableId === tableId)!;
  }

  viewSettings: any = {
    defaultView: '',
    views: [],
    currentView: {},
  };

  saveViewSettings(viewSettings: any) {
    this.viewSettings.defaultView = viewSettings.defaultView;
    this.viewSettings.views = viewSettings.views;
    this.viewSettings.currentView = viewSettings.currentView;
  }

  getViewSettings(): any {
    return this.viewSettings;
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
    let currentTree = this.trees.find((tree) => tree.treeId === treeId);
    if (currentTree) {
      currentTree.treeLoaded = treeLoaded;
      currentTree.tree = tree;
      currentTree.selectedReports = selectedReports;
      currentTree.selectedNode = selectedNode;
    } else {
      this.trees.push({
        treeId: treeId,
        treeLoaded: treeLoaded,
        tree: tree,
        selectedReports: selectedReports,
        selectedNode: selectedNode,
      });
    }
  }

  getTreeSettings(treeId: string): TreeSettings {
    let tree = this.trees.find((tree) => tree.treeId === treeId);
    return tree != undefined
      ? tree
      : {
          treeId: treeId,
          treeLoaded: false,
          tree: [],
          selectedReports: [],
          selectedNode: -1,
        };
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

  setTestReports(testReports: any[]) {
    this.testReports = testReports;
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
