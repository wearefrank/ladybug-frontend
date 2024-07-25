import { Component, Output, ViewChild } from '@angular/core';
import { CreateTreeItem, FileTreeOptions, NgSimpleFileTree, NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgSimpleFileTreeModule],
  selector: 'app-test-folder-tree',
  templateUrl: './test-folder-tree.component.html',
  styleUrl: './test-folder-tree.component.css',
})
export class TestFolderTreeComponent {
  @ViewChild('tree') tree!: NgSimpleFileTree;
  @Output() changeFolderEvent: Subject<string> = new Subject<string>();
  rootFolder: CreateTreeItem = {
    name: 'Reports',
    icon: 'assets/tree-icons/folder.svg',
  };
  treeOptions: FileTreeOptions = {
    folderBehaviourOnClick: 'select',
    expandAllFolders: true,
    highlightOpenFolders: false,
    autoSelectCondition: (item: CreateTreeItem) => this.autoSelectItem(item),
  };
  originalItems?: CreateTreeItem[];

  autoSelectItem(item: CreateTreeItem): boolean {
    return item.name === this.rootFolder.name;
  }

  selectItem(value: string): void {
    value = this.removeSlashesFromPathEnds(value);
    const path: string = value.length > 0 ? `Reports/${value}` : 'Reports';
    this.tree.selectItem(path);
  }

  removeSlashesFromPathEnds(path: string): string {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  setData(data: CreateTreeItem[]): void {
    this.resetTree();
    this.originalItems = data;
    const tempItems: CreateTreeItem[] = this.convertToFolders(data);
    const rootFolder: CreateTreeItem = Object.assign({}, this.rootFolder);
    if (tempItems && tempItems.length > 0) {
      rootFolder.children = tempItems;
    }
    this.tree.addItem(rootFolder);
  }

  convertToFolders(items: CreateTreeItem[]): CreateTreeItem[] {
    const tempItems: CreateTreeItem[] = [];
    const folderNames: string[] = [];
    for (let item of items) {
      if (item.path) {
        const tempItem: CreateTreeItem | undefined = this.createFolderFromPath(item.path);
        if (tempItem && !folderNames.includes(tempItem.path!)) {
          folderNames.push(tempItem.path!);
          tempItems.push(tempItem);
        }
      }
    }
    return tempItems;
  }

  createFolderFromPath(path: string): CreateTreeItem | undefined {
    let index = path.indexOf('/');
    if (index === 0) {
      index = path.indexOf('/', 2);
    }
    if (index === -1) {
      return undefined;
    }
    let folderName = path.slice(0, index);
    const remainingPath = path.replace(folderName, '');
    if (folderName.startsWith('/')) {
      folderName = folderName.slice(1);
    }
    const treeItem: CreateTreeItem = { name: folderName, icon: 'assets/tree-icons/folder.svg' };
    if (remainingPath && remainingPath !== '/' && remainingPath !== '') {
      const child = this.createFolderFromPath(remainingPath);
      if (child) {
        treeItem.children = [child];
      }
    }
    return treeItem;
  }

  resetTree(): void {
    if (this.tree) {
      this.tree.clearItems();
    }
    this.originalItems = [];
  }
}
