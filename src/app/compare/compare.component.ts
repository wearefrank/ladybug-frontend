import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CompareTreeComponent } from './compare-tree/compare-tree.component';
import { NodeLinkStrategy } from '../shared/enums/compare-method';
import { CompareData } from './compare-data';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements OnInit, AfterViewInit {
  @ViewChild('trees') compareTreeComponent!: CompareTreeComponent;
  diffOptions = { theme: 'vs', language: 'xml', readOnly: true, renderSideBySide: true, automaticLayout: true };
  originalModel: DiffEditorModel = {
    code: '',
    language: 'xml',
  };

  modifiedModel: DiffEditorModel = {
    code: '',
    language: 'xml',
  };

  constructor(public compareData: CompareData) {}

  ngOnInit(): void {
    console.log(this.compareData);
    this.renderDiffs(this.compareData.originalReport.xml, this.compareData.runResultReport.xml);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showReports();
    }, 100);
  }

  showReports(): void {
    if (this.compareData.originalReport && this.compareData.runResultReport) {
      this.compareTreeComponent?.createTrees(
        this.compareData.viewName,
        this.compareData.nodeLinkStrategy,
        this.compareData.originalReport,
        this.compareData.runResultReport,
      );
    }
  }

  showDifference(data: any): void {
    const leftSide = data.leftReport ? this.extractMessage(data.leftReport) : '';
    const rightSide = data.rightReport ? this.extractMessage(data.rightReport) : '';
    this.renderDiffs(leftSide, rightSide);
  }

  changeNodeLinkStrategy(nodeLinkStrategy: NodeLinkStrategy): void {
    this.compareData.nodeLinkStrategy = nodeLinkStrategy;
  }

  extractMessage(report: any): string {
    return report.parentElement ? report.value.message ?? '' : report.value.xml ?? '';
  }

  renderDiffs(leftSide: string, rightSide: string): void {
    this.originalModel = Object.assign({}, this.originalModel, {
      code: leftSide,
    });
    this.modifiedModel = Object.assign({}, this.originalModel, {
      code: rightSide,
    });
  }
}
