import { AfterViewInit, Component, Injectable, Input, ViewChild } from '@angular/core';
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
  @ViewChild('trees') compareTreeComponent!: CompareTreeComponent;
  @ViewChild('diffComponent') diffComponent!: NgxTextDiffComponent;
  leftId: string = this.compareData.id + '-left';
  rightId: string = this.compareData.id + '-right';

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

  showDifference(data: any) {
    if (!data.leftReport.parentElement) {
      this.diffComponent.left = data.leftReport.value.xml;
      this.diffComponent.right = data.rightReport.value.xml;
    } else {
      this.diffComponent.left = data.leftReport.value.message;
      this.diffComponent.right = data.rightReport.value.message;
    }
    this.diffComponent.renderDiffs();
  }
}
