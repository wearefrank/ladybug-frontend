import { Component, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { DisplayComponent } from '../shared/components/display/display.component';
import { Report } from '../shared/interfaces/report';
import { TreeNode } from '../shared/interfaces/tree-node';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
})
export class DebugComponent {
  @ViewChild(TreeComponent) treeComponent!: TreeComponent;
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;

  constructor() {}

  addReportToTree(newReport: Report): void {
    this.treeComponent.handleChange(newReport);
  }

  showReportInDisplay(currentReport: TreeNode): void {
    this.displayComponent.closeReport(false, -1);
    setTimeout(() => {
      this.displayComponent.showReport(currentReport);
    }, 100);
  }

  closeEntireTree(): void {
    this.displayComponent.closeReport(false, -1);
  }

  closeDisplayReport(): void {
    this.displayComponent.closeReport(false, -1);
  }

  closeReport(currentReport: TreeNode): void {
    this.treeComponent.removeNode(currentReport);
  }
}
