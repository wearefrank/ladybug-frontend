import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../shared/services/http.service';
import { CloneModalComponent } from './clone-modal/clone-modal.component';
import { TestSettingsModalComponent } from './test-settings-modal/test-settings-modal.component';
import { TestResult } from '../shared/interfaces/test-result';
import { ReranReport } from '../shared/interfaces/reran-report';
import { catchError, Observable, of, Subscription } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { HelperService } from '../shared/services/helper.service';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { ToastService } from '../shared/services/toast.service';
import { UpdatePathSettings } from '../shared/interfaces/update-path-settings';
import { TestFolderTreeComponent } from './test-folder-tree/test-folder-tree.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../shared/components/button/button.component';
import { TestListItem } from '../shared/interfaces/test-list-item';
import { OptionsSettings } from '../shared/interfaces/options-settings';
import { ErrorHandling } from '../shared/classes/error-handling.service';
import { BooleanToStringPipe } from '../shared/pipes/boolean-to-string.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { TestReportsService } from './test-reports.service';
import { TestTableComponent } from './test-table/test-table.component';

export const updatePathActionConst = ['move', 'copy'] as const;
export type UpdatePathAction = (typeof updatePathActionConst)[number];

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  standalone: true,
  imports: [
    TestFolderTreeComponent,
    ButtonComponent,
    ReactiveFormsModule,
    FormsModule,
    ToastComponent,
    TestSettingsModalComponent,
    CloneModalComponent,
    DeleteModalComponent,
    BooleanToStringPipe,
    TestTableComponent,
  ],
})
export class TestComponent implements OnInit, OnDestroy {
  static readonly ROUTER_PATH: string = 'test';

  protected reports: TestListItem[] = new Array<TestListItem>();
  protected generatorEnabled: boolean = false;
  protected currentFilter: string = '';
  protected showStorageIds?: boolean;
  protected amountOfSelectedReports: number = 0;

  private updatePathAction: UpdatePathAction = 'move';
  private subscriptions: Subscription = new Subscription();
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;
  @ViewChild(DeleteModalComponent) deleteModal!: DeleteModalComponent;
  @ViewChild(TestFolderTreeComponent) testFileTreeComponent!: TestFolderTreeComponent;
  @ViewChild('moveToInput', { read: NgModel }) moveToInputModel!: NgModel;

  constructor(
    private httpService: HttpService,
    private helperService: HelperService,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
    private testReportsService: TestReportsService,
  ) {
    this.getStorageIdsFromLocalStorage();
    this.setGeneratorStatusFromLocalStorage();
  }

  ngOnInit(): void {
    this.subscribeToSubscriptions();
    this.loadData();
    this.matches();
    localStorage.removeItem('generatorEnabled');
  }

  ngOnDestroy(): void {
    this.unsubscribeFromSubscriptions();
  }

  subscribeToSubscriptions(): void {
    const amountSelectedSubscription: Subscription = this.testReportsService.amountSelected$.subscribe({
      next: (amount: number): void => {
        this.amountOfSelectedReports = amount;
        if (this.amountOfSelectedReports === this.reports.length) {
          this.setCheckedForAllReports(true);
        } else if (this.amountOfSelectedReports === 0) {
          this.setCheckedForAllReports(false);
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(amountSelectedSubscription);
  }

  unsubscribeFromSubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  getStorageIdsFromLocalStorage(): void {
    this.showStorageIds = localStorage.getItem('showReportStorageIds') === 'true';
  }

  updateShowStorageIds(show: boolean): void {
    this.showStorageIds = show;
  }

  setGeneratorStatusFromLocalStorage(): void {
    const generatorStatus: string | null = localStorage.getItem('generatorEnabled');
    if (generatorStatus && generatorStatus.length <= 5) {
      this.generatorEnabled = generatorStatus === 'true';
    } else {
      this.httpService.getSettings().subscribe({
        next: (response: OptionsSettings) => {
          this.generatorEnabled = response.generatorEnabled;
          localStorage.setItem('generatorEnabled', String(this.generatorEnabled));
        },
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  loadData(path?: string): void {
    this.testReportsService.testReports$.subscribe({
      next: (value: TestListItem[]) => {
        this.reports = value;
        this.setCheckedForAllReports(true);
        this.amountOfSelectedReports = value.length;
        if (this.testFileTreeComponent) {
          this.testFileTreeComponent.setData(this.reports);
          this.testFileTreeComponent.selectItem(path ?? this.testFileTreeComponent.rootFolder.name);
        }
        this.matches();
        this.refresh();
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  openCloneModal(): void {
    if (this.getSelectedReports().length === 1) {
      this.cloneModal.open(this.getSelectedReports()[0]);
    } else {
      this.toastService.showWarning('Make sure only one report is selected at a time');
    }
  }

  addCopiedReports(metadata: TestListItem[]): void {
    const amountAdded: number = metadata.length - this.reports.length;
    if (amountAdded > 0) {
      for (let index = this.reports.length; index <= metadata.length - 1; index++) {
        if (metadata[index].showReport) metadata[index].checked = true;
        this.reports.push(metadata[index]);
      }
      this.refresh();
    }
  }

  getCopiedReports(): void {
    this.httpService
      .getTestReports(this.testReportsService.metadataNames, this.testReportsService.storageName)
      .subscribe({
        next: (response: TestListItem[]) => this.addCopiedReports(response),
        error: () => catchError(this.errorHandler.handleError()),
      });
  }

  resetRunner(): void {
    for (const report of this.reports) {
      report.reranReport = null;
    }
    this.refresh();
  }

  run(report: TestListItem): void {
    if (this.generatorEnabled) {
      this.httpService.runReport(this.testReportsService.storageName, report.storageId).subscribe({
        next: (response: TestResult): void => {
          report.reranReport = this.createReranReport(response);
        },
        error: () =>
          catchError((error: HttpErrorResponse): Observable<any> => {
            report.error = error.message;
            return of(error);
          }),
      });
    } else {
      this.toastService.showWarning('Generator is disabled!');
    }
  }

  runSelected(): void {
    for (const report of this.getSelectedReports()) {
      this.run(report);
    }
    this.refresh();
  }

  createReranReport(result: TestResult): ReranReport {
    const originalReport: Report = result.originalReport;
    const runResultReport: Report = result.runResultReport;

    originalReport.xml = result.originalXml;
    runResultReport.xml = result.runResultXml;

    return {
      id: result.originalReport.storageId,
      originalReport: result.originalReport,
      runResultReport: result.runResultReport,
      color: result.equal ? 'green' : 'red',
      resultString: result.info,
    };
  }

  openDeleteModal(): void {
    const reportsToBeDeleted: TestListItem[] = this.getSelectedReports();
    if (reportsToBeDeleted.length > 0) {
      this.deleteModal.open(reportsToBeDeleted);
    }
  }

  deleteSelected(): void {
    this.httpService
      .deleteReport(this.helperService.getSelectedIds(this.reports), this.testReportsService.storageName)
      .subscribe({
        next: () => this.testReportsService.getReports(),
        error: () => catchError(this.errorHandler.handleError()),
      });
  }

  downloadSelected(): void {
    const selectedReports: TestListItem[] = this.getSelectedReports();
    if (selectedReports.length > 0) {
      let queryString: string = '';
      for (let report of selectedReports) {
        queryString += `id=${report.storageId}&`;
      }
      this.helperService.download(queryString, this.testReportsService.storageName, true, false);
    } else {
      this.toastService.showWarning('No Report Selected!');
    }
  }

  uploadReport(event: Event): void {
    const eventTarget = event.target as HTMLInputElement;
    const file: File | undefined = eventTarget.files?.[0];
    if (file) {
      const formData: FormData = new FormData();
      formData.append('file', file);
      this.httpService.uploadReportToStorage(formData, this.testReportsService.storageName).subscribe({
        next: () => this.loadData(),
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
    this.refresh();
  }

  copySelected(): void {
    const copiedIds: number[] = this.helperService.getSelectedIds(this.reports);
    const data: Record<string, number[]> = {
      [this.testReportsService.storageName]: copiedIds,
    };
    this.httpService.copyReport(data, this.testReportsService.storageName).subscribe({
      next: () => this.loadData(),
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.testReportsService.getReports();
  }

  toggleCheck(report: TestListItem): void {
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
    }
  }

  setCheckedForAllReports(value: boolean): void {
    for (const report of this.reports) {
      report.checked = value;
    }
    this.refresh();
  }

  updatePath(): void {
    const reportIds: number[] = this.helperService.getSelectedIds(this.reports);
    if (reportIds.length > 0) {
      const path: string = this.transformPath(this.moveToInputModel.value);
      const map: UpdatePathSettings = { path: path, action: this.updatePathAction };
      this.httpService.updatePath(reportIds, this.testReportsService.storageName, map).subscribe({
        next: () => this.loadData(path),
        error: () => catchError(this.errorHandler.handleError()),
      });
      this.matches();
      this.testReportsService.getReports();
      this.refresh();
    } else {
      this.toastService.showWarning('No Report Selected!');
    }
  }

  setUpdatePathAction(value: UpdatePathAction): void {
    this.updatePathAction = value;
  }

  changeFilter(filter: string): void {
    this.currentFilter = filter === this.testFileTreeComponent.rootFolder.name ? '' : this.transformPath(filter);
    for (const report of this.reports) {
      report.checked = report.showReport ?? false;
    }
    this.matches();
  }

  transformPath(path: string): string {
    if (path.length > 0 && !path.startsWith('/')) {
      path = `/${path}`;
    }
    if (!path.endsWith('/')) {
      path = `${path}/`;
    }
    return path;
  }

  matches(): void {
    for (const report of this.reports) {
      report.showReport = false;
      if (report.path === null) report.path = '';
      const name: string = report.path + report.name;
      if (new RegExp(`(/)?${this.currentFilter}.*`).test(name)) {
        report.showReport = true;
      }
    }
  }

  getSelectedReports(): TestListItem[] {
    return this.reports?.filter((item: TestListItem) => item.checked) ?? [];
  }

  refresh(): void {
    this.reports = [...this.reports];
  }
}
