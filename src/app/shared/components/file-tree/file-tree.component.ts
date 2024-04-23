import { Component, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Report } from '../../interfaces/report';
import {
  CreateTreeItem,
  FileTreeItem,
  FileTreeOptions,
  NgSimpleFileTree,
  OptionalParameters,
  TreeItemComponent,
} from 'ng-simple-file-tree';
import { Subject, Subscription } from 'rxjs';
import { SettingsService } from '../../services/settings.service';
import { HelperService } from '../../services/helper.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-file-tree',
  templateUrl: './file-tree.component.html',
  styleUrl: './file-tree.component.css',
})
export class FileTreeComponent implements OnDestroy {
  @Input() treeData: any;
  @Input() childrenKey: string | undefined;
  @Input() treeOptions!: FileTreeOptions;
  @Input() currentView?: any;
  @Output() treeClosed: Subject<void> = new Subject<void>();

  @Output() reportSelected: Subject<Report> = new Subject<Report>();

  @ViewChild('tree') tree!: NgSimpleFileTree;
  private lastReport?: Report;
  private showMultipleAtATime!: boolean;
  private showMultipleAtATimeSubscription!: Subscription;

  constructor(
    private settingsService: SettingsService,
    private helperService: HelperService,
    private httpService: HttpService,
  ) {
    this.subscribeToSettingsServiceObservables();
  }

  ngOnDestroy() {
    this.showMultipleAtATimeSubscription.unsubscribe();
  }

  subscribeToSettingsServiceObservables(): void {
    this.showMultipleAtATimeSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe(
      (value: boolean) => {
        this.showMultipleAtATime = value;
        if (!this.showMultipleAtATime) {
          this.removeAllReportsButOne();
        }
      },
    );
  }

  removeAllReportsButOne(): void {
    if (this.lastReport) {
      this.addReportToTree(this.lastReport);
    }
  }

  hideOrShowCheckpointsBasedOnView(currentView: any): void {
    if (this.tree) {
      this.checkUnmatchedCheckpoints(this.getTreeReports(), currentView);
    }
  }

  getTreeReports(): Report[] {
    let reports: any[] = [];
    for (const item of this.tree.getItems()) {
      if (item.originalValue.storageId != undefined) {
        reports.push(item.originalValue);
      }
    }
    return reports;
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

  addReportToTree(report: Report): void {
    this.lastReport = report;
    if (!this.showMultipleAtATime) {
      this.tree.clearItems();
    }
    const newReport: CreateTreeItem = this.transformReportToHierarchyStructure(report);
    const optional: OptionalParameters = { childrenKey: 'checkpoints', pathAttribute: 'uid' };
    const path: string = this.tree.addItem(newReport, optional);
    this.tree.selectItem(path);
    if (this.currentView) {
      this.hideOrShowCheckpointsBasedOnView(this.currentView);
    }
  }

  transformReportToHierarchyStructure(report: Report): Report {
    const checkpoints = report.checkpoints;
    for (let i = 0; i < checkpoints.length; i++) {
      checkpoints[i].icon = this.helperService.getImage(
        checkpoints[i].type,
        checkpoints[i].encoding,
        checkpoints[i].level,
      );
      if (i - 1 >= 0 && checkpoints[i].type > 1) {
        if (!checkpoints[i - 1].checkpoints) {
          checkpoints[i - 1].checkpoints = [];
        }
        checkpoints[i - 1].checkpoints!.push(checkpoints[i]);
        checkpoints.splice(i, 1);
        i--;
      }
    }
    report.checkpoints = checkpoints;
    return report;
  }

  checkUnmatchedCheckpoints(reports: Report[], currentView: any) {
    for (let report of reports) {
      if (report.storageName === currentView.storageName) {
        this.httpService
          .getUnmatchedCheckpoints(report.storageName, report.storageId.toString(), currentView.currentViewName)
          .subscribe((unmatched: any) => {
            this.hideCheckpoints(unmatched, this.tree.elements.toArray());
          });
      }
    }
  }

  removeReport(report: any): void {
    this.tree.removeItem(report.path);
  }

  closeAll(): void {
    this.treeClosed.next();
    this.tree.clearItems();
  }

  changeSearchTerm(event: KeyboardEvent): void {
    const term: string = (event.target as HTMLInputElement).value;
    this.tree.searchTree(term);
  }

  selectReport(value: FileTreeItem): void {
    this.reportSelected.next(value.originalValue);
  }
}
