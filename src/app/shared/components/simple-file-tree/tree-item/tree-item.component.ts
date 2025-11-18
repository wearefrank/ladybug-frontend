import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FileTreeItem } from '../models/file-tree-item';
import { TreeIconComponent } from '../tree-icon/tree-icon.component';
import type { NgSimpleFileTree } from '../ng-simple-file-tree.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tree-item',
  standalone: true,
  templateUrl: './tree-item.component.html',
  styleUrl: './tree-item.component.css',
  imports: [TreeIconComponent, NgClass],
})
export class TreeItemComponent implements OnInit {
  @Input({ required: true }) parentTree!: NgSimpleFileTree;
  @Input() item!: FileTreeItem;
  @Input() lastChild = false;
  @Input() index!: number;
  @ViewChild('element') element!: ElementRef<HTMLElement>;
  @ViewChild('childElement') childElement!: TreeItemComponent;
  justClicked = false;

  ngOnInit(): void {
    this.subscribeToItemService();
    this.setAutoFunctions();
  }

  setAutoFunctions(): void {
    if (this.parentTree.options.autoOpenCondition && !this.item.expanded) {
      this.item.expanded = this.parentTree.options.autoOpenCondition!(this.item.originalValue);
    }
    if (this.parentTree.options.autoSelectCondition && !this.item.currentlySelected) {
      this.item.currentlySelected = this.parentTree.options.autoSelectCondition!(this.item.originalValue);
    }
  }

  subscribeToItemService(): void {
    this.parentTree.state.itemSelectedObservable.subscribe((value: FileTreeItem): void => {
      if (!this.justClicked) {
        this.item.currentlySelected =
          value.path == this.item.path ||
          (this.parentTree.options.highlightOpenFolders && this.getParentPath(value) === this.item.path);
        if (this.item.currentlySelected && this.item.parent) {
          this.item.parent.selectedChildIndex = this.index;
        }
        //Set index to -1 if an item is selected that is not in the path
        if (this.item.parent && this.getParentPath(value) !== this.item.parent.path) {
          this.item.parent.selectedChildIndex = -1;
        }
      }
      this.justClicked = false;
    });
  }

  onDoubleClick(): void {
    if (this.parentTree.options.doubleClickToOpenFolders) {
      this.item.expanded = !this.item.expanded;
    }
  }

  onClick(): void {
    if (this.item.hasChildren()) {
      this.handleFolderClick();
    } else {
      this.item.currentlySelected = true;
      if (this.item.parent) {
        this.item.parent.selectedChildIndex = this.index;
      }
    }
    this.justClicked = true;
    this.parentTree.state.nextItem(this.item);
  }

  handleFolderClick(): void {
    if (this.parentTree.options.folderBehaviourOnClick !== 'select') {
      this.item.expanded = !this.item.expanded;
    }
    if (
      this.parentTree.options.folderBehaviourOnClick == 'both' ||
      this.parentTree.options.folderBehaviourOnClick == 'select'
    ) {
      this.item.currentlySelected = true;
    }
  }

  getParentPath(value: FileTreeItem): string {
    let parentPath: string = value.path.replace(value.getPathAttribute(), '');
    if (parentPath.endsWith('/')) {
      return parentPath.slice(0, -1);
    }
    return parentPath;
  }

  shouldEnableVerticalLine(child: FileTreeItem, index: number): boolean {
    return child.currentlySelected || this.item.selectedChildIndex > index;
  }

  shouldEnableHorizontalLine(item: FileTreeItem): boolean {
    return !!(
      (this.parentTree.options.hierarchyLines?.vertical || this.parentTree.options.hierarchyLines?.horizontal) &&
      item.currentlySelected
    );
  }
}
