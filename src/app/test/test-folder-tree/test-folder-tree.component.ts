import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';

@Component({
  selector: 'app-test-folder-tree',
  templateUrl: './test-folder-tree.component.html',
  styleUrls: ['./test-folder-tree.component.css'],
})
export class TestFolderTreeComponent implements AfterViewInit {
  @ViewChild('treeReference') treeReference!: jqxTreeComponent;
  baseFolder: any = { label: 'Reports', value: '', filter: '', items: [], expanded: true, selected: true };
  latestAddedFolder: any = this.baseFolder;
  @Output() changeFolderEvent = new EventEmitter<any>();

  constructor() {}

  ngAfterViewInit(): void {
    this.treeReference.createComponent({ source: [this.baseFolder], height: '90%', width: '100%' });
  }

  updateFolderTree(reports: any, addedFolderPath: any) {
    this.resetFolders();
    reports.forEach((report: any) => {
      this.addFolder(report.path);
    });
    this.treeReference.clear();
    this.treeReference.addTo(this.baseFolder, null);
    this.selectNewFolder(addedFolderPath);
  }

  resetFolders() {
    this.baseFolder = {
      label: 'Reports',
      value: '',
      items: [],
      expanded: true,
      selected: true,
    };
  }

  addFolder(path: string): void {
    if (path) {
      let folderNames = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
      folderNames.pop();
      this.recursivelyAddFolders(folderNames, this.baseFolder.items, '/');
    }
  }

  recursivelyAddFolders(folderNames: string[], currentFolders: any[], previousFilter: string): void {
    if (folderNames.length > 0) {
      let name = folderNames.shift()!;
      let currentFolder = currentFolders.find((folder) => folder.label === name);

      if (!currentFolder) {
        currentFolder = this.createNewFolder(name, previousFilter);
        currentFolders.push(currentFolder);
      }

      this.latestAddedFolder = currentFolder;
      this.recursivelyAddFolders(folderNames, currentFolder.items, currentFolder.value);
    }
  }

  selectNewFolder(addedFolderPath: string) {
    if (addedFolderPath) {
      let item = this.treeReference.getItems().find((item: any) => addedFolderPath === item.value);
      if (item) {
        this.treeReference.selectItem(item);
        this.changeFolderEvent.next(item.value);
      }
    }
  }

  createNewFolder(name: string, previousFilter: string): any {
    return {
      label: name,
      value: previousFilter + name + '/',
      items: [],
      expanded: true,
    };
  }

  selectFolder(event: any) {
    this.changeFolderEvent.next(event.owner.selectedItem.value);
  }
}
