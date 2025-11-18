/* eslint-disable @angular-eslint/no-input-rename */
/* eslint-disable @angular-eslint/component-selector */
import { Component, Inject, Input, OnDestroy, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { FileTreeOptions } from './models/file-tree-options';
import { FileTreeItem, OptionalParameters } from './models/file-tree-item';
import { CreateTreeItem } from './models/create-tree-item';
import { TreeItemComponent } from './tree-item/tree-item.component';
import { Treestate } from './models/treestate';
import { Subject, Subscription } from 'rxjs';

@Inject({
  providedIn: 'root',
})
@Component({
  selector: 'ng-simple-tree',
  standalone: true,
  templateUrl: './ng-simple-file-tree.component.html',
  styleUrl: './ng-simple-file-tree.component.css',
  imports: [TreeItemComponent],
})
export class NgSimpleFileTree implements OnInit, OnDestroy {
  @Input('data') public treeData!: CreateTreeItem[];
  @Input({ alias: 'options', required: false }) options!: FileTreeOptions;
  @Input('childrenKey') public childrenKey?: string;
  @Input('pathAttribute') public pathAttributes?: string[];
  @Output() protected itemSelected: Subject<FileTreeItem> = new Subject<FileTreeItem>();
  protected itemSubscription!: Subscription;
  public items: FileTreeItem[] = [];
  @ViewChildren('elements') elements!: QueryList<TreeItemComponent>;
  public state: Treestate = new Treestate();

  ngOnInit(): void {
    this.createFileTreeItems();
    this.subscribeToItemService();
  }

  ngOnDestroy(): void {
    this.itemSubscription.unsubscribe();
  }

  private createFileTreeItems(): void {
    if (this.treeData) {
      for (let treeDatum of this.treeData) {
        this.items.push(
          FileTreeItem.fromJson(treeDatum, this, {
            childrenKey: this.childrenKey,
            pathAttributes: this.pathAttributes,
          }),
        );
      }
    }
  }

  private subscribeToItemService(): void {
    this.itemSubscription = this.state.itemSelectedObservable.subscribe((value: FileTreeItem): void => {
      this.itemSelected.next(value);
    });
  }

  public searchTree(value: string): string {
    const items: { matches: FileTreeItem[]; other: FileTreeItem[] } = this.searchItems(value, this.items);
    for (let item of items.matches) {
      item.setFontColor('red');
    }
    for (let item of items.other) {
      item.setFontColor('');
    }
    return value;
  }

  public searchItems(value: string, items: FileTreeItem[]): { matches: FileTreeItem[]; other: FileTreeItem[] } {
    const returnObject: { matches: FileTreeItem[]; other: FileTreeItem[] } = { matches: [], other: [] };
    for (let item of items) {
      if (item.name.includes(value) && value != '') {
        returnObject.matches.push(item);
      } else {
        returnObject.other.push(item);
      }
      if (item.hasChildren()) {
        const result = this.searchItems(value, item.children!);
        returnObject.matches.push(...result.matches);
        returnObject.other.push(...result.other);
      }
    }
    return returnObject;
  }

  public selectItem(path: string): void {
    const item = this.findItemWithPath(path, this.items);
    if (item) {
      if (item.parent) {
        item.parent.expanded = true;
      }
      this.state.nextItem(item);
    }
  }

  private findItemWithPath(path: string, items: FileTreeItem[]): FileTreeItem | undefined {
    const children: FileTreeItem[] = [];
    for (let item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.hasChildren()) {
        children.push(...item.children!);
      }
    }
    if (children.length === 0) {
      return;
    }
    return this.findItemWithPath(path, children);
  }

  public getSelected(): FileTreeItem {
    return this.state.getLastSelected();
  }

  public addItem(item: CreateTreeItem, optional?: OptionalParameters): string {
    if (!this.treeData) {
      this.treeData = [];
    }
    if (!this.items) {
      this.items = [];
    }
    this.treeData.push(item);
    const treeItem: FileTreeItem = this.createItemToFileItem(item, optional);
    this.items.push(treeItem);
    return treeItem.path;
  }

  public createItemToFileItem(createItem: CreateTreeItem, optional?: OptionalParameters): FileTreeItem {
    return FileTreeItem.fromJson(
      createItem,
      this,
      optional ?? {
        childrenKey: this.childrenKey,
        pathAttributes: this.pathAttributes,
      },
    );
  }

  public removeItem(path: string): void {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].path === path) {
        this.items.splice(i, 1);
      }
    }
  }

  public clearItems(): void {
    this.items = [] as FileTreeItem[];
    this.treeData = [] as CreateTreeItem[];
  }

  public expandAll(): void {
    this.setExpandedForAll(true);
  }

  public collapseAll(): void {
    this.setExpandedForAll(false);
  }

  private setExpandedForAll(value: boolean): void {
    for (let item of this.items) {
      item.expanded = value;
      if (item.hasChildren()) {
        this.setExpandedForChildren(item.children!, value);
      }
    }
  }

  private setExpandedForChildren(children: FileTreeItem[], value: boolean): void {
    for (let child of children) {
      child.expanded = value;
      if (child.hasChildren()) {
        this.setExpandedForChildren(child.children!, value);
      }
    }
  }
}
