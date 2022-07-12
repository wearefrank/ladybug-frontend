import { AfterViewInit, Component, Injectable, Input, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { TreeNode } from '../shared/interfaces/tree-node';
import { NgxTextDiffComponent } from 'ngx-text-diff';

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
  @ViewChild('diffComponent') diffComponent!: NgxTextDiffComponent;
  left: any = {
    currentReport: {},
    id: Math.random().toString(36).slice(7),
  };

  right: any = {
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
      this.treeRightComponent?.handleChange(this.compareData.runResultReport);
      this.treeRightComponent?.selectSpecificNode(nodeNumber);
    }
  }

  selectReport(currentReport: TreeNode, leftReport: boolean) {
    if (leftReport) {
      this.left.currentReport = currentReport;
      this.selectOther(this.treeRightComponent, this.left.currentReport, this.right.currentReport);
    } else {
      this.right.currentReport = currentReport;
      this.selectOther(this.treeLeftComponent, this.right.currentReport, this.left.currentReport);
    }

    if (this.left.currentReport.ladybug && this.right.currentReport.ladybug) {
      this.loadDifference(this.left.currentReport, this.right.currentReport);
    }
  }

  selectOther(treeComponent: TreeComponent, thisReport: TreeNode, otherReport: TreeNode) {
    if (thisReport.id != otherReport.id) {
      treeComponent?.selectSpecificNode(thisReport.id);
    }
  }

  loadDifference(leftReport: TreeNode, rightReport: TreeNode) {
    if (leftReport.root) {
      this.diffComponent.left = leftReport.ladybug.xml;
      this.diffComponent.right = rightReport.ladybug.xml;
    } else {
      this.diffComponent.left = leftReport.ladybug.message;
      this.diffComponent.right = rightReport.ladybug.message;
    }

    this.diffComponent.renderDiffs();
  }
}
