import { Component, Output, ViewChild } from '@angular/core';
import { Child, CreateTreeItem, FileTreeOptions, NgSimpleFileTree, NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  imports: [NgSimpleFileTreeModule],
  selector: 'app-test-folder-tree',
  templateUrl: './test-folder-tree.component.html',
  styleUrl: './test-folder-tree.component.css',
})
export class TestFolderTreeComponent {
  public rootFolder: CreateTreeItem = {
    name: 'Reports',
    icon: 'assets/tree-icons/folder.svg',
  };
  @Output() changeFolderEvent: Subject<string> = new Subject<string>();
  @ViewChild('tree') tree!: NgSimpleFileTree;
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

  selectItem(value: string) {
    value = this.removeSlashesFromPathEnds(value);
    let path;
    path = value.length > 0 ? `Reports/${value}` : 'Reports';
    this.tree.selectItem(path);
  }

  removeSlashesFromPathEnds(path: string) {
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    if (path.endsWith('/')) {
      path = path.slice(0, -1);
    }
    return path;
  }

  setData(data: CreateTreeItem[]) {
    this.resetTree();
    this.originalItems = data;
    const tempItems = this.convertToFolders(data);
    let rootFolder = Object.assign({}, this.rootFolder);
    if (tempItems && tempItems.length > 0) {
      rootFolder.children = tempItems;
    }
    this.tree.addItem(rootFolder);
  }

  convertToFolders(items: CreateTreeItem[]) {
    const tempItems: CreateTreeItem[] = [];
    for (let item of items) {
      if (item.path) {
        try {
          tempItems.push(this.createFolderFromPath(item.path));
        } catch {}
      }
    }
    return tempItems;
  }

  createFolderFromPath(path: string): CreateTreeItem {
    let index = path.indexOf('/');
    if (index === 0) {
      index = path.indexOf('/', 2);
    }
    if (index === -1) {
      throw new Error('Path had only 1 slash');
    }
    let folderName = path.slice(0, index);
    const remainingPath = path.replace(folderName, '');
    if (folderName.startsWith('/')) {
      folderName = folderName.slice(1);
    }
    const treeItem = { name: folderName, icon: 'assets/tree-icons/folder.svg' } as CreateTreeItem;
    if (remainingPath && remainingPath !== '/' && remainingPath !== '') {
      const child = this.createFolderFromPath(remainingPath);
      treeItem.children = [child as Child];
    }
    return treeItem;
  }

  resetTree() {
    if (this.tree) {
      this.tree.clearItems();
    }
    this.originalItems = [];
  }
}
