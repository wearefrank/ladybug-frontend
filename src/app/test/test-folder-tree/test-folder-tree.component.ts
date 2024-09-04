import { Component, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { SimpleFileTreeUtil } from '../../shared/util/simple-file-tree-util';
import { CreateTreeItem, FileTreeOptions, NgSimpleFileTree, NgSimpleFileTreeModule } from 'ng-simple-file-tree';
import { TestListItem } from '../../shared/interfaces/test-list-item';

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
  readonly rootFolder: CreateTreeItem = {
    name: 'Reports',
    path: '',
  };
  treeOptions: FileTreeOptions = {
    folderBehaviourOnClick: 'select',
    doubleClickToOpenFolders: false,
    expandAllFolders: true,
    highlightOpenFolders: false,
    autoSelectCondition: (item: CreateTreeItem) => this.autoSelectItem(item),
    determineIconClass: SimpleFileTreeUtil.conditionalCssClass,
  };

  setData(data: TestListItem[]): void {
    this.convertToTree(data);
    this.tree.selectItem(this.rootFolder.path!);
  }

  convertToTree(data: TestListItem[]): void {
    this.tree.items = [];
    this.rootFolder.children = [];
    for (let item of data) {
      if (item.path) {
        this.nextAction(
          item,
          item.path.split('/').filter((s) => s !== ''),
          this.rootFolder,
        );
      }
    }
    this.tree.addItem(this.rootFolder);
  }

  nextAction(itemToAdd: CreateTreeItem, routeParts: string[], currentLocation: CreateTreeItem) {
    if (routeParts.length > 0) {
      const nextRoutePart = routeParts[0];
      let newChild = this.getChildForNextRoutePart(nextRoutePart, currentLocation);
      if (currentLocation.children) {
        currentLocation.children.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        currentLocation.children = [];
      }

      if (!newChild) {
        newChild = {
          name: nextRoutePart,
        } as CreateTreeItem;
        currentLocation.children.push(newChild);
      }
      this.nextAction(itemToAdd, routeParts.slice(1), newChild);
    }
  }

  getChildForNextRoutePart(routePart: string, currentLocation: CreateTreeItem) {
    if (currentLocation.children) {
      for (const child of currentLocation.children) {
        if (child.name === routePart) {
          return child;
        }
      }
    }
    return null;
  }

  autoSelectItem(item: CreateTreeItem): boolean {
    return item.path === this.rootFolder.name;
  }
}
