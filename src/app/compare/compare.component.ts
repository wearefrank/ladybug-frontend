import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CompareTreeComponent } from './compare-tree/compare-tree.component';
import { CompareData } from './compare-data';
import { DiffEditorModel, MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TabService } from '../shared/services/tab.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MetadataTableComponent } from '../shared/components/metadata-table/metadata-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { NodeLinkStrategy, nodeLinkStrategyConst } from '../shared/enums/node-link-strategy';
import { Report } from '../shared/interfaces/report';
import { Checkpoint } from '../shared/interfaces/checkpoint';
import { ReportUtil } from '../shared/util/report-util';
import { StrReplacePipe } from '../shared/pipes/str-replace.pipe';
import { ViewDropdownComponent } from '../shared/components/view-dropdown/view-dropdown.component';
import { View } from '../shared/interfaces/view';
import { HttpService } from '../shared/services/http.service';
import { ErrorHandling } from '../shared/classes/error-handling.service';
import { catchError } from 'rxjs';
import { SimpleFileTreeUtil } from '../shared/util/simple-file-tree-util';
import { DebugComponent } from '../debug/debug.component';
import { TreeItemComponent } from 'ng-simple-file-tree';

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
    ViewDropdownComponent,
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
    readOnly: false,
    originalEditable: true,
    renderSideBySide: true,
    automaticLayout: true,
    scrollBeyondLastLine: false,
  };
  protected originalModel: DiffEditorModel = { code: '', language: 'xml' };
  protected modifiedModel: DiffEditorModel = { code: '', language: 'xml' };
  protected leftReport?: Report;
  protected rightReport?: Report;
  protected leftNode?: Report | Checkpoint;
  protected rightNode?: Report | Checkpoint;
  protected compareData?: CompareData;
  protected views?: View[];
  protected currentView?: View;

  constructor(
    public tabService: TabService,
    private route: ActivatedRoute,
    private router: Router,
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
  ) {}

  ngOnInit(): void {
    this.compareData = this.getData(this.getIdsFromPath());
    this.getStrategyFromLocalStorage();
    this.getViews();
  }

  ngAfterViewInit(): void {
    if (this.compareData) {
      this.renderDiffs(this.compareData.originalReport.xml, this.compareData.runResultReport.xml);
      this.showReports();
    } else {
      this.router.navigate([DebugComponent.ROUTER_PATH]);
    }
  }

  private getViews() {
    this.httpService
      .getViews()
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe((views: View[]) => {
        const filteredViews: View[] = views.filter((v: View) => {
          return (
            v.storageName === this.compareData?.originalReport.storageName ||
            v.storageName === this.compareData?.runResultReport.storageName
          );
        });
        if (filteredViews.length > 0) {
          this.views = filteredViews;
          if (this.compareData?.viewName) {
            const view = this.views.find((v) => v.name === this.compareData!.viewName);
            if (view) {
              this.changeView(view);
              return;
            }
          }
          this.changeView(views[0]);
        }
      });
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
    if (ReportUtil.isReport(this.leftNode)) {
      this.leftReport = { ...this.leftNode };
    }
    if (ReportUtil.isReport(this.rightNode)) {
      this.rightReport = { ...this.rightNode };
    }
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

  protected changeView(view: View): void {
    if (this.leftReport?.storageName && this.rightReport?.storageName) {
      this.hideOrShowCheckpoints(
        view,
        this.leftReport.storageName,
        this.leftReport.storageId,
        this.compareTreeComponent.leftTree.elements.toArray(),
      );
      this.hideOrShowCheckpoints(
        view,
        this.rightReport.storageName,
        this.rightReport.storageId,
        this.compareTreeComponent.rightTree.elements.toArray(),
      );
    }
    this.currentView = view;
  }

  private hideOrShowCheckpoints(
    view: View,
    storageName: string,
    storageId: number,
    treeElements: TreeItemComponent[],
  ): void {
    this.httpService
      .getUnmatchedCheckpoints(storageName, storageId, view.name)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (response: string[]) => SimpleFileTreeUtil.hideOrShowCheckpoints(response, treeElements),
      });
  }
}
