import { AfterViewInit, Component, Injectable, Input, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { TreeNode } from '../shared/interfaces/tree-node';
import { MonacoEditorComponent } from '../shared/components/monaco-editor/monaco-editor.component';

@Injectable()
export class CompareData {
  originalReport: any;
  runResultReport: any;
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements AfterViewInit {
  @ViewChild('leftTree') treeLeftComponent!: TreeComponent;
  @ViewChild('rightTree') treeRightComponent!: TreeComponent;
  @ViewChild('editor') monacoEditor!: MonacoEditorComponent;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  treeLeft: any = {
    currentReport: {},
    id: Math.random().toString(36).slice(7),
  };

  treeRight: any = {
    currentReport: {},
    id: Math.random().toString(36).slice(7),
  };

  constructor(public compareData: CompareData) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showReports(0);
    });
  }

  showReports(nodeNumber: number) {
    if (this.compareData.originalReport) {
      this.treeLeftComponent?.handleChange(this.compareData.originalReport);
      this.treeLeftComponent?.selectSpecificNode(nodeNumber);
    }

    if (this.compareData.runResultReport) {
      this.treeRightComponent?.handleChange(this.compareData.originalReport);
      this.treeRightComponent?.selectSpecificNode(nodeNumber);
    }
  }

  selectReport(currentReport: TreeNode, leftReport: boolean) {
    if (leftReport) {
      this.treeLeft.currentReport = currentReport;
      this.selectOther(this.treeRightComponent, this.treeLeft.currentReport, this.treeRight.currentReport);
    } else {
      this.treeRight.currentReport = currentReport;
      this.selectOther(this.treeLeftComponent, this.treeRight.currentReport, this.treeLeft.currentReport);
    }

    if (this.treeLeft.currentReport.ladybug && this.treeRight.currentReport.ladybug) {
      this.loadDifference(this.treeLeft.currentReport, this.treeRight.currentReport);
    }
  }

  selectOther(treeComponent: TreeComponent, thisReport: any, otherReport: any) {
    if (thisReport.id != otherReport.id) {
      treeComponent?.selectSpecificNode(thisReport.id);
    }
  }

  loadDifference(leftReport: TreeNode, rightReport: TreeNode) {
    if (leftReport.root) {
      this.monacoEditor.loadMonaco(leftReport.ladybug.xml, rightReport.ladybug.xml);
    } else {
      this.monacoEditor.loadMonaco(leftReport.ladybug.message, rightReport.ladybug.message);
    }
  }
}
