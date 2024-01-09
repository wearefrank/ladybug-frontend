import { AfterViewInit, Component, Injectable, ViewChild } from '@angular/core';
import { CompareTreeComponent } from './compare-tree/compare-tree.component';
import { NodeLinkStrategy } from '../shared/enums/compare-method';
import { TextCompareComponent } from '../text-compare/text-compare.component';

@Injectable()
export class CompareData {
  id!: string;
  originalReport: any;
  runResultReport: any;
  viewName: string = '';
  nodeLinkStrategy: NodeLinkStrategy = NodeLinkStrategy.NONE;
}

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements AfterViewInit {
  @ViewChild('trees') compareTreeComponent!: CompareTreeComponent;

  @ViewChild('diffComponent') diffComponent!: TextCompareComponent;

  constructor(public compareData: CompareData) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showReports();
    }, 100);
  }

  showReports() {
    if (this.compareData.originalReport && this.compareData.runResultReport) {
      this.compareTreeComponent?.createTrees(
        this.compareData.viewName,
        this.compareData.nodeLinkStrategy,
        this.compareData.originalReport,
        this.compareData.runResultReport
      );
    }
  }

  showDifference(data: any) {
    let leftSide = data.leftReport ? this.extractMessage(data.leftReport) : '';
    let rightSide = data.rightReport
      ? this.extractMessage(data.rightReport)
      : '';
    this.saveDiff(leftSide, rightSide);
  }
  changeNodeLinkStrategy(nodeLinkStrategy: NodeLinkStrategy) {
    this.compareData.nodeLinkStrategy = nodeLinkStrategy;
  }

  extractMessage(report: any): string {
    return report.parentElement
      ? report.value.message ?? ''
      : report.value.xml ?? '';
  }

  saveDiff(leftSide: string, rightSide: string) {
    // this.diffComponent.left = leftSide;
    // this.diffComponent.right = rightSide;
    // this.diffComponent.renderDiffs();
  }
}
