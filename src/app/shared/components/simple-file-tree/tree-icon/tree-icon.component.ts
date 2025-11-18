import { Component, Input } from '@angular/core';
import { FileTreeItem } from '../models/file-tree-item';
import type { NgSimpleFileTree } from '../ng-simple-file-tree.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tree-icon',
  standalone: true,
  templateUrl: './tree-icon.component.html',
  styleUrl: './tree-icon.component.css',
  imports: [NgClass],
})
export class TreeIconComponent {
  @Input({ required: true }) parentTree!: NgSimpleFileTree;
  @Input() item!: FileTreeItem;
  @Input() expanded?: boolean | null = false;

  hasExtension(value: string): boolean {
    let extensionWithDot;
    let extensionWithoutDot;
    if (this.item.extension && this.item.extension.startsWith('.')) {
      extensionWithDot = this.item.extension;
      extensionWithoutDot = this.item.extension.replace('.', '');
    } else {
      extensionWithDot = `.${this.item.extension}`;
      extensionWithoutDot = this.item.extension;
    }
    return value == extensionWithoutDot || value == extensionWithDot;
  }

  toggleExpanded(event: Event): void {
    event.stopPropagation();
    this.item.expanded = !this.item.expanded;
  }
}
