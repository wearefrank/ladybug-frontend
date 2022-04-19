import { Component, Input, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { DisplayComponent } from '../shared/components/display/display.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { CompareReport } from '../shared/interfaces/compare-report';
import { Report } from '../shared/interfaces/report';
import { TreeNode } from '../shared/interfaces/tree-node';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
import { MonacoEditorComponent } from '../shared/components/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent {
  leftReport: CompareReport = {
    reports: [],
    id: 'leftId',
    current: {} as TreeNode,
    selected: false,
  };
  rightReport: CompareReport = {
    reports: [],
    id: 'rightId',
    current: {} as TreeNode,
    selected: false,
  };
  @ViewChild('leftTree') leftTreeComponent!: TreeComponent;
  @ViewChild('rightTree') rightTreeComponent!: TreeComponent;
  @ViewChild('leftDisplay') leftDisplayComponent!: DisplayComponent;
  @ViewChild('rightDisplay') rightDisplayComponent!: DisplayComponent;
  @ViewChild('editor') monacoEditor!: MonacoEditorComponent;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @Input() diffReports = { originalReport: {} as Report, runResultReport: {} as Report };

  constructor() {}

  /**
   * Select report based on the specified ids in diffReports
   */
  selectReportBasedOnIds(): void {
    if (Object.keys(this.diffReports.originalReport).length > 0) {
      this.diffReports.originalReport.id = 'leftId';
      this.addReportNodeLeft(this.diffReports.originalReport);
    }

    if (Object.keys(this.diffReports.runResultReport).length > 0) {
      this.diffReports.runResultReport.id = 'rightId';
      this.addReportNodeRight(this.diffReports.runResultReport);
    }
  }

  /**
   * Adds a report to the left tree
   * @param newReport - report to be added
   */
  addReportNodeLeft(newReport: Report): void {
    if (this.leftReport.id === newReport.id) {
      this.leftReport.reports = [newReport];
      this.leftTreeComponent?.resetTree();
      this.leftTreeComponent?.handleChange(newReport);
      this.leftTreeComponent?.selectSpecificNode(0);
    }
  }

  /**
   * Adds a report to the right tree
   * @param newReport - report to be added
   */
  addReportNodeRight(newReport: Report): void {
    if (this.rightReport.id === newReport.id) {
      this.rightReport.reports = [newReport];
      this.rightTreeComponent?.resetTree();
      this.rightTreeComponent?.handleChange(newReport);
      this.rightTreeComponent?.selectSpecificNode(0);
    }
  }

  /**
   * Show the report of the left tree on the left display
   * @param currentReport - the report to be displayed
   */
  selectReportLeft(currentReport: TreeNode): void {
    this.leftReport.selected = true;
    this.leftReport.current = currentReport;
    this.leftDisplayComponent?.showReport(this.leftReport.current);
    this.rightTreeComponent?.selectSpecificNode(currentReport.id);

    if (this.rightReport.current.ladybug) {
      this.loadDifference(this.leftReport.current, this.rightReport.current);
    }
  }

  loadDifference(leftReport: TreeNode, rightReport: TreeNode) {
    if (leftReport.root) {
      this.monacoEditor.loadMonaco(leftReport.ladybug.xml, rightReport.ladybug.xml);
    } else {
      this.monacoEditor.loadMonaco(leftReport.ladybug.message, rightReport.ladybug.message);
    }
  }

  /**
   * Show the report of the right tree on the right display
   * @param currentReport - the report to be displayed
   */
  selectReportRight(currentReport: TreeNode): void {
    this.rightReport.selected = true;
    this.rightReport.current = currentReport;
    this.rightDisplayComponent?.showReport(this.rightReport.current);
    this.leftTreeComponent?.selectSpecificNode(currentReport.id);

    if (this.leftReport.current.ladybug) {
      this.loadDifference(this.leftReport.current, this.rightReport.current);
    }
  }

  /**
   * Close the left report
   * @param currentNode - the left node to be removed
   */
  closeReportLeft(): void {
    this.leftReport.selected = false;
    this.leftReport.current = {} as TreeNode;
    // this.leftTreeComponent?.removeNode(currentNode);
  }

  /**
   * Close the right report
   * @param currentNode - the right node to be removed
   */
  closeReportRight(): void {
    this.rightReport.selected = false;
    this.rightReport.current = {} as TreeNode;
    // this.rightTreeComponent?.removeNode(currentNode);
  }
}
