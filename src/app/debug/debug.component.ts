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
  reports: Report[] = [];
  currentReport: TreeNode = {
    id: -1,
    ladybug: undefined,
    level: -1,
    root: false,
    text: '',
  };
  @ViewChild(TreeComponent) treeComponent!: TreeComponent;
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;

  constructor() {}

  /**
    Add a new report and notify the tree of the change
   */
  addReportToTree(newReport: Report): void {
    this.reports.push(newReport);
    this.treeComponent.handleChange(newReport, false);
  }

  /**
   * Select a report to be viewed in the display
   * @param currentReport - the report to be viewed
   */
  showReportInDisplay(currentReport: TreeNode): void {
    this.currentReport = currentReport;
    this.displayComponent.showReport(this.currentReport);
  }

  closeEntireTree(): void {
    this.displayComponent.closeReport(false);
  }

  /**
   * Close a report
   * @param currentReport - the report to be closed
   */
  closeReport(currentReport: TreeNode): void {
    this.currentReport = {
      id: -1,
      ladybug: undefined,
      level: -1,
      root: false,
      text: '',
    };
    this.treeComponent.removeNode(currentReport);
  }
}
