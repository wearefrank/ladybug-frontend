import { Component, EventEmitter, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { HelperService } from '../../shared/services/helper.service';
import { catchError, Observable, Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { SettingsService } from '../../shared/services/settings.service';
import {
  CreateTreeItem,
  FileTreeItem,
  FileTreeOptions,
  NgSimpleFileTree,
  NgSimpleFileTreeModule,
  OptionalParameters,
  TreeItemComponent,
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
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';
import { SimpleFileTreeUtil } from '../../shared/util/simple-file-tree-util';

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
  showMultipleAtATimeSubscription!: Subscription;

  private _currentView: any;
  private lastReport?: Report | null;

  treeOptions: FileTreeOptions = {
    highlightOpenFolders: false,
    folderBehaviourOnClick: 'select',
    autoOpenCondition: this.conditionalOpenFunction,
    determineIconClass: SimpleFileTreeUtil.conditionalCssClass,
  };

  constructor(
    private helperService: HelperService,
    private httpService: HttpService,
    private settingsService: SettingsService,
    private errorHandler: ErrorHandling,
  ) {
    this.subscribeToSettingsServiceObservables();
  }

  ngOnDestroy() {
    this.showMultipleAtATimeSubscription.unsubscribe();
  }

  @Input() set currentView(value: any) {
    if (this._currentView !== value) {
      // TODO: Check if the current reports are part of the view
      this.hideOrShowCheckpointsBasedOnView(value);
    }
    this._currentView = value;
  }

  get currentView(): any {
    return this._currentView;
  }

  hideOrShowCheckpointsBasedOnView(currentView: any): void {
    if (this.tree) {
      this.checkUnmatchedCheckpoints(this.getTreeReports(), currentView);
    }
  }

  checkUnmatchedCheckpoints(reports: Report[], currentView: any) {
    for (let report of reports) {
      if (report.storageName === currentView.storageName) {
        this.httpService.getUnmatchedCheckpoints(report.storageName, report.storageId, currentView.name).subscribe({
          next: (unmatched: any) => this.hideCheckpoints(unmatched, this.tree.elements.toArray()),
          error: () => catchError(this.errorHandler.handleError()),
        });
      }
    }
  }

  getTreeReports(): Report[] {
    let reports: any[] = [];
    this.tree.getItems().forEach((item: FileTreeItem) => {
      if (item.originalValue.storageId != undefined) {
        reports.push(item.originalValue);
      }
    });
    return reports;
  }

  subscribeToSettingsServiceObservables(): void {
    this.showMultipleAtATimeSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe({
      next: (value: boolean) => {
        this.showMultipleAtATime = value;
        if (!this.showMultipleAtATime) {
          this.removeAllReportsButOne();
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  hideCheckpoints(unmatched: string[], items: TreeItemComponent[]): void {
    for (let item of items) {
      if (unmatched.length === 0 || !unmatched) {
        item.setVisible(true);
      } else if (unmatched.includes(item.item.originalValue.uid)) {
        item.setVisible(false);
      }
      if (item.item.children) {
        this.hideCheckpoints(unmatched, [item.childElement]);
      }
    }
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
    const optional: OptionalParameters = { childrenKey: 'checkpoints', pathAttributes: ['name', 'storageId', 'uid'] };
    const path: string = this.tree.addItem(newReport, optional);
    this.tree.selectItem(path);
    if (this.currentView) {
      this.hideOrShowCheckpointsBasedOnView(this.currentView);
    }
  }

  selectReport(value: FileTreeItem): void {
    this.selectReportEvent.emit(value.originalValue);
  }

  removeReport(report: any): void {
    this.tree.removeItem(report.path);
  }

  closeEntireTree(): void {
    this.closeEntireTreeEvent.emit();
    this.tree.clearItems();
    this.lastReport = null;
  }

  expandAll(): void {
    this.tree.expandAll();
  }

  collapseAll(): void {
    this.tree.collapseAll();
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
    for (let item of this.tree.getItems()) {
      const treeReport = item.originalValue as Report;
      if (treeReport.storageId === report.storageId) {
        this.tree.selectItem(item.path);
        return true;
      }
    }
    return false;
  }
}
