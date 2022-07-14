import { AfterViewInit, Component, Injectable, Input, ViewChild } from '@angular/core';
import { TreeComponent } from '../shared/components/tree/tree.component';
import { TreeNode } from '../shared/interfaces/tree-node';
import { NgxTextDiffComponent } from 'ngx-text-diff';
import { CompareTreeComponent } from '../shared/components/compare-tree/compare-tree.component';

@Injectable()
export class CompareData {
  id!: string;
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
  @ViewChild('trees') compareTreeComponent!: CompareTreeComponent;
  @ViewChild('diffComponent') diffComponent!: NgxTextDiffComponent;
  left: any = {
    currentReport: {},
    id: this.compareData.id + '-left',
  };

  right: any = {
    currentReport: {},
    id: this.compareData.id + '-right',
  };

  constructor(public compareData: CompareData) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showReports();
    }, 100);
  }

  showReports() {
    if (this.compareData.originalReport && this.compareData.runResultReport) {
      this.compareTreeComponent?.createTrees(this.compareData.originalReport, this.compareData.runResultReport);
    }
  }

  selectReport(data: any) {
    let currentReport: TreeNode = data.data;
    if (data.left) {
      this.left.currentReport = currentReport;
      this.selectOther(this.left.currentReport, this.right.currentReport, false);
    } else {
      this.right.currentReport = currentReport;
      this.selectOther(this.right.currentReport, this.left.currentReport, true);
    }

    if (this.left.currentReport.ladybug && this.right.currentReport.ladybug) {
      this.loadDifference(this.left.currentReport, this.right.currentReport);
    }
  }

  selectOther(thisReport: TreeNode, otherReport: TreeNode, left: boolean) {
    if (thisReport.id != otherReport.id) {
      this.compareTreeComponent?.selectSpecificNode(thisReport.id, left);
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
