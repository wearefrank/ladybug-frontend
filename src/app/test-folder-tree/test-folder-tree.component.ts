import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { TestTreeNode } from '../shared/interfaces/test-tree-node';
declare var $: any;

@Component({
  selector: 'app-test-folder-tree',
  templateUrl: './test-folder-tree.component.html',
  styleUrls: ['./test-folder-tree.component.css'],
})
export class TestFolderTreeComponent implements AfterViewInit {
  TREE_SELECTOR: string = '#testFolderTree';
  baseFolder: TestTreeNode = { text: 'Reports', filter: '', nodes: [], state: { expanded: true, selected: true } };
  currentFolder: TestTreeNode = this.baseFolder;
  @Output() changeFolderEvent = new EventEmitter<any>();

  constructor() {}

  ngAfterViewInit(): void {
    this.updateTreeView();
  }

  addFolder(path: string): void {
    if (path === '/') {
      this.selectNewFolder(this.baseFolder);
    } else {
      let folderNames = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
      this.recursivelyAddFolders(folderNames, this.baseFolder.nodes, '');
    }
    this.changeFolderEvent.next(this.currentFolder.filter);
    this.updateTreeView();
  }

  recursivelyAddFolders(folderNames: string[], currentFolders: TestTreeNode[], previousFilter: string): void {
    if (folderNames.length > 0) {
      let name = folderNames.shift()!;
      let currentFolder = currentFolders.find((folder) => folder.text === name);

      if (!currentFolder) {
        currentFolder = this.createNewFolder(name, previousFilter);
        currentFolders.push(currentFolder);
      }

      this.selectNewFolder(currentFolder);
      this.recursivelyAddFolders(folderNames, currentFolder.nodes, currentFolder.filter);
    }
  }

  createNewFolder(name: string, previousFilter: string): TestTreeNode {
    return {
      text: name,
      filter: previousFilter + '/' + name,
      nodes: [],
      state: { expanded: true },
    };
  }

  selectNewFolder(folder: TestTreeNode): void {
    this.currentFolder.state.selected = false;
    this.currentFolder = folder;
    this.currentFolder.state.selected = true;
  }

  updateTreeView(): void {
    $(() => {
      $(this.TREE_SELECTOR).treeview({
        data: [this.baseFolder],
        levels: 5,
        expandIcon: 'fa fa-plus',
        collapseIcon: 'fa fa-minus',
        selectedBackColor: '#1ab394',
      });

      $(this.TREE_SELECTOR).on('nodeSelected', (event: any, folder: TestTreeNode) => {
        this.changeFolderEvent.next(folder.filter);
      });
    });
  }

  removeUnusedFolders(testReports: any[]): void {
    let testReportNames: string[] = [];
    testReports.forEach((report) => {
      testReportNames.push(report.name);
    });

    this.baseFolder.nodes = this.recursivelyRemoveFolders(testReportNames, this.baseFolder.nodes);
  }

  recursivelyRemoveFolders(testReportNames: string[], folders: TestTreeNode[]): TestTreeNode[] {
    let foldersToKeep: TestTreeNode[] = [];
    folders.forEach((folder) => {
      if (this.tryMatchingNameToFolder(folder, testReportNames)) {
        foldersToKeep.push(folder);
      }
    });

    return foldersToKeep;
  }

  tryMatchingNameToFolder(currentFolder: TestTreeNode, testReportNames: string[]): boolean {
    let found: boolean = false;

    for (let name of testReportNames) {
      if (this.matches(name, currentFolder.filter)) {
        currentFolder.nodes = this.recursivelyRemoveFolders(testReportNames, currentFolder.nodes);
        found = true;
        break;
      }
    }
    return found;
  }

  matches(name: string, filter: string): boolean {
    return ('/' + name).match('(/)*' + filter + '/.*') != undefined;
  }
}
