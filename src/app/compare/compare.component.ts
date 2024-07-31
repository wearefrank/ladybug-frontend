import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CompareTreeComponent } from './compare-tree/compare-tree.component';
import { CompareData } from './compare-data';
import { DiffEditorModel, MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TabService } from '../shared/services/tab.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MetadataTableComponent } from '../shared/components/display-table/metadata-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { NodeLinkStrategy, nodeLinkStrategyConst } from '../shared/enums/node-link-strategy';
import { Report } from '../shared/interfaces/report';
import { Checkpoint } from '../shared/interfaces/checkpoint';
import { ReportUtil } from '../shared/util/report-util';
import { StrReplacePipe } from '../shared/pipes/str-replace.pipe';

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css'],
  standalone: true,
  imports: [
    CompareTreeComponent,
    MetadataTableComponent,
    MonacoEditorModule,
    ReactiveFormsModule,
    TitleCasePipe,
    FormsModule,
    StrReplacePipe,
  ],
})
export class CompareComponent implements AfterViewInit, OnInit {
  static readonly ROUTER_PATH: string = 'compare';
  @ViewChild(CompareTreeComponent) compareTreeComponent!: CompareTreeComponent;
  protected readonly nodeLinkStrategyConst = nodeLinkStrategyConst;
  protected nodeLinkStrategy!: NodeLinkStrategy;
  protected diffOptions = {
    theme: 'vs',
    language: 'xml',
    readOnly: true,
    renderSideBySide: true,
    automaticLayout: true,
  };
  protected originalModel: DiffEditorModel = { code: '', language: 'xml' };
  protected modifiedModel: DiffEditorModel = { code: '', language: 'xml' };

  protected leftNode?: Report | Checkpoint;
  protected rightNode?: Report | Checkpoint;

  protected compareData?: CompareData;

  constructor(
    public tabService: TabService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.compareData = this.getData(this.getIdsFromPath());
    this.getStrategyFromLocalStorage();
  }

  ngAfterViewInit(): void {
    if (this.compareData) {
      this.renderDiffs(this.compareData.originalReport.xml, this.compareData.runResultReport.xml);
      this.showReports();
    } else {
      this.router.navigate(['debug']);
    }
  }

  private getData(id: string): CompareData | undefined {
    return this.tabService.activeCompareTabs.get(id);
  }

  private getIdsFromPath(): string {
    return this.route.snapshot.paramMap.get('id') as string;
  }

  private renderDiffs(leftSide: string, rightSide: string): void {
    this.originalModel = { ...this.originalModel, code: leftSide };
    this.modifiedModel = { ...this.originalModel, code: rightSide };
  }

  private getStrategyFromLocalStorage(): void {
    if (this.compareData) {
      const strategy: string | null = localStorage.getItem(this.compareData.viewName + '.NodeLinkStrategy');
      this.nodeLinkStrategy = strategy ? (strategy as NodeLinkStrategy) : 'NONE';
    }
  }

  private showReports(): void {
    this.compareTreeComponent.createTrees(this.compareData!.originalReport, this.compareData!.runResultReport);
  }

  protected syncLeftAndRight(): void {
    this.leftNode = this.compareTreeComponent.leftTree.getSelected().originalValue;
    this.rightNode = this.compareTreeComponent.rightTree.getSelected().originalValue;
    this.showDifference();
  }

  protected showDifference(): void {
    if (this.leftNode && this.rightNode) {
      const leftSide: string = this.extractMessage(this.leftNode);
      const rightSide: string = this.extractMessage(this.rightNode);
      this.renderDiffs(leftSide, rightSide);
    }
  }

  private extractMessage(selectedNode: Report | Checkpoint): string {
    return ReportUtil.isReport(selectedNode) ? selectedNode.xml : selectedNode.message;
  }

  protected changeNodeLinkStrategy(): void {
    if (this.compareData && this.nodeLinkStrategy) {
      localStorage.setItem(this.compareData.viewName + '.NodeLinkStrategy', this.nodeLinkStrategy);
    }
  }
}
