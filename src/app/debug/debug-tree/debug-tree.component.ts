import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { catchError, firstValueFrom, Observable, Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { SettingsService } from '../../shared/services/settings.service';
import {
  CreateTreeItem,
  FileTreeItem,
  FileTreeOptions,
  NgSimpleFileTree,
  NgSimpleFileTreeModule,
} from 'ng-simple-file-tree';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ReportHierarchyTransformer } from '../../shared/classes/report-hierarchy-transformer';
import { SimpleFileTreeUtil } from '../../shared/util/simple-file-tree-util';
import { View } from '../../shared/interfaces/view';
import { DebugTabService } from '../debug-tab.service';
import { ErrorHandling } from '../../shared/classes/error-handling.service';

@Component({
  selector: 'app-debug-tree',
  templateUrl: './debug-tree.component.html',
  styleUrls: ['./debug-tree.component.css'],
  standalone: true,
  imports: [
    ButtonComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    NgSimpleFileTreeModule,
  ],
})
export class DebugTreeComponent implements OnDestroy {
  @ViewChild('tree') tree!: NgSimpleFileTree;
  @Input() adjustWidth: Observable<void> = {} as Observable<void>;
  @Output() selectReportEvent = new EventEmitter<Report>();
  @Output() closeEntireTreeEvent = new EventEmitter<any>();

  showMultipleAtATime!: boolean;
  subscriptions: Subscription = new Subscription();

  private _currentView!: View;
  private lastReport?: Report | null;

  treeOptions: FileTreeOptions = {
    highlightOpenFolders: false,
    folderBehaviourOnClick: 'select',
    doubleClickToOpenFolders: false,
    autoOpenCondition: this.conditionalOpenFunction,
    determineIconClass: SimpleFileTreeUtil.conditionalCssClass,
  };

  constructor(
    private httpService: HttpService,
    private settingsService: SettingsService,
    private debugTab: DebugTabService,
    private errorHandler: ErrorHandling,
  ) {
    this.subscribeToSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  subscribeToSubscriptions(): void {
    const showMultipleSubscription: Subscription = this.settingsService.showMultipleAtATimeObservable.subscribe({
      next: (value: boolean) => {
        this.showMultipleAtATime = value;
        if (!this.showMultipleAtATime) {
          this.removeAllReportsButOne();
        }
      },
    });
    this.subscriptions.add(showMultipleSubscription);
    const refreshAll: Subscription = this.debugTab.refreshAll$.subscribe((ids: number[]) => this.refreshReports(ids));
    this.subscriptions.add(refreshAll);
    const refreshTree: Subscription = this.debugTab.refreshTree$.subscribe((ids: number[]) => this.refreshReports(ids));
    this.subscriptions.add(refreshTree);
  }

  @Input({ required: true }) set currentView(value: View) {
    if (this._currentView !== value) {
      // TODO: Check if the current reports are part of the view
      this.hideOrShowCheckpointsBasedOnView(value);
    }
    this._currentView = value;
  }

  hideOrShowCheckpointsBasedOnView(currentView: View): void {
    if (this.tree) {
      this.checkUnmatchedCheckpoints(this.getTreeReports(), currentView);
    }
  }

  checkUnmatchedCheckpoints(reports: Report[], currentView: View) {
    for (let report of reports) {
      if (report.storageName === currentView.storageName) {
        this.httpService
          .getUnmatchedCheckpoints(report.storageName, report.storageId, currentView.name)
          .pipe(catchError(this.errorHandler.handleError()))
          .subscribe({
            next: (unmatched: string[]) =>
              SimpleFileTreeUtil.hideOrShowCheckpoints(unmatched, this.tree.elements.toArray()),
          });
      }
    }
  }

  getTreeReports(): Report[] {
    const reports: Report[] = [];
    for (const item of this.tree.items) {
      if (item.originalValue.storageId != undefined) {
        reports.push(item.originalValue);
      }
    }
    return reports;
  }

  removeAllReportsButOne(): void {
    if (this.tree) {
      this.tree.clearItems();
    }
    if (this.lastReport) {
      this.addReportToTree(this.lastReport);
    }
  }

  addReportToTree(report: Report): void {
    if (this.selectReportIfPresent(report)) {
      return;
    }
    this.lastReport = report;
    if (!this.showMultipleAtATime) {
      this.tree.clearItems();
    }
    const newReport: CreateTreeItem = new ReportHierarchyTransformer().transform(report);
    const path: string = this.tree.addItem(newReport);
    this.tree.selectItem(path);
    if (this._currentView) {
      this.hideOrShowCheckpointsBasedOnView(this._currentView);
    }
  }

  closeEntireTree(): void {
    this.closeEntireTreeEvent.emit();
    this.tree.clearItems();
    this.lastReport = null;
  }

  changeSearchTerm(event: KeyboardEvent): void {
    const term: string = (event.target as HTMLInputElement).value;
    this.tree.searchTree(term);
  }

  conditionalOpenFunction(item: CreateTreeItem): boolean {
    const type = item['type'];
    return type === undefined || type === 1 || type === 2;
  }

  selectReportIfPresent(report: Report): boolean {
    for (let item of this.tree.items) {
      const treeReport: Report = item.originalValue;
      if (treeReport.storageId === report.storageId) {
        this.tree.selectItem(item.path);
        return true;
      }
    }
    return false;
  }

  async refreshReports(ids: number[]): Promise<void> {
    const selectedReportId = this.tree.getSelected().originalValue.storageId;
    let lastSelectedReport: FileTreeItem | undefined;
    for (let i = 0; i < this.tree.items.length; i++) {
      const report: Report = this.tree.items[i].originalValue as Report;
      if (ids.includes(report.storageId)) {
        const fileItem: FileTreeItem = await this.getNewReport(report.storageId);
        if (selectedReportId === report.storageId) {
          lastSelectedReport = fileItem;
        }
        this.tree.items[i] = fileItem;
      }
    }
    if (lastSelectedReport) {
      this.tree.selectItem(lastSelectedReport.path);
    }
    this.hideOrShowCheckpointsBasedOnView(this._currentView);
  }

  async getNewReport(storageId: number): Promise<FileTreeItem> {
    const response: Report = await firstValueFrom(
      this.httpService
        .getReport(storageId, this._currentView.storageName)
        .pipe(catchError(this.errorHandler.handleError())),
    );
    const transformedReport: Report = new ReportHierarchyTransformer().transform(response);
    return this.tree.createItemToFileItem(transformedReport);
  }
}
