import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CompareTreeComponent } from './compare-tree/compare-tree.component';
import { NodeLinkStrategy } from '../shared/enums/compare-method';
import { CompareData } from './compare-data';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { TabService } from '../shared/services/tab.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
})
export class CompareComponent implements OnInit, AfterViewInit {
  static readonly leftReportKey: string = 'leftId';
  static readonly rightReportKey: string = 'rightId';
  static readonly ROUTER_PATH: string = 'compare';
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
  id?: string;

  compareData: CompareData | undefined;

  constructor(
    public tabService: TabService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.compareData = this.getData(this.getIdsFromPath());
    if (this.compareData) {
      this.renderDiffs(this.compareData.originalReport.xml, this.compareData.runResultReport.xml);
    } else {
      this.router.navigate(['debug']);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.showReports();
    }, 100);
  }

  getIdsFromPath() {
    return this.route.snapshot.paramMap.get('id') as string;
  }

  getData(id: string) {
    return this.tabService.activeCompareTabs.get(id);
  }

  showReports(): void {
    if (this.compareData && this.compareData.originalReport && this.compareData.runResultReport) {
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
    if (this.compareData) {
      this.compareData.nodeLinkStrategy = nodeLinkStrategy;
    }
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
