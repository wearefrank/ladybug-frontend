import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../shared/services/http.service';
import { CloneModalComponent } from './clone-modal/clone-modal.component';
import { TestSettingsModalComponent } from './test-settings-modal/test-settings-modal.component';
import { TestResult } from '../shared/interfaces/test-result';
import { ReranReport } from '../shared/interfaces/reran-report';
import { catchError, Observable, of } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { HelperService } from '../shared/services/helper.service';
import { ToastService } from '../shared/services/toast.service';
import { TabService } from '../shared/services/tab.service';
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
import { DeleteModalComponent } from '../shared/components/delete-modal/delete-modal.component';

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
    BooleanToStringPipe,
    DeleteModalComponent,
    TestTableComponent,
  ],
})
export class TestComponent implements OnInit {
  static readonly ROUTER_PATH: string = 'test';

  protected reports: TestListItem[] = [];
  protected generatorEnabled: boolean = false;
  protected currentFilter: string = '';
  protected showStorageIds?: boolean;

  private updatePathAction: UpdatePathAction = 'move';
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;
  @ViewChild(DeleteModalComponent) deleteModal!: DeleteModalComponent;
  @ViewChild(TestFolderTreeComponent) testFileTreeComponent!: TestFolderTreeComponent;
  @ViewChild('moveToInput', { read: NgModel }) moveToInputModel!: NgModel;
  @ViewChild(TestTableComponent) testTableComponent!: TestTableComponent;

  constructor(
    private httpService: HttpService,
    private helperService: HelperService,
    private toastService: ToastService,
    private tabService: TabService,
    private errorHandler: ErrorHandling,
    private testReportsService: TestReportsService,
  ) {
    this.getStorageIdsFromLocalStorage();
    this.setGeneratorStatusFromLocalStorage();
  }

  ngOnInit(): void {
    this.loadData();
    this.matches();
    localStorage.removeItem('generatorEnabled');
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
      this.httpService
        .getSettings()
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: (response: OptionsSettings) => {
            this.generatorEnabled = response.generatorEnabled;
            localStorage.setItem('generatorEnabled', String(this.generatorEnabled));
          },
        });
    }
  }

  loadData(path?: string): void {
    this.testReportsService.getReports();
    this.testReportsService.testReports$.subscribe({
      next: (value: TestListItem[]) => {
        this.reports = value;
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
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (response: TestListItem[]) => this.addCopiedReports(response),
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
      this.httpService
        .runReport(this.testReportsService.storageName, report.storageId)
        .pipe(
          catchError((error: HttpErrorResponse): Observable<any> => {
            report.error = error.message;
            return of(error);
          }),
        )
        .subscribe({
          next: (response: TestResult): void => {
            report.reranReport = this.createReranReport(response);
            this.refresh();
          },
        });
    } else {
      this.toastService.showWarning('Generator is disabled!');
    }
  }

  runSelected(): void {
    for (const report of this.getSelectedReports()) {
      this.run(report);
    }
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

  openDeleteModal(deleteAllReports: boolean): void {
    const reportsToBeDeleted: TestListItem[] = this.getSelectedReports();
    if (this.reports && (reportsToBeDeleted.length > 0 || (deleteAllReports && this.reports.length > 0))) {
      this.deleteModal.open(deleteAllReports, reportsToBeDeleted);
    } else {
      this.toastService.showWarning('No reports to be deleted!');
    }
  }

  deleteReports(deleteAllReports: boolean): void {
    if (deleteAllReports) {
      this.deleteAllReports();
    } else if (this.reports) {
      this.httpService
        .deleteReport(this.helperService.getSelectedIds(this.reports), this.testReportsService.storageName)
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: () => this.testReportsService.getReports(),
        });
    }
  }

  deleteAllReports(): void {
    this.httpService
      .deleteAllReports(this.testReportsService.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: () => this.testReportsService.getReports(),
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
    const eventTarget: HTMLInputElement = event.target as HTMLInputElement;
    const file: File | undefined = eventTarget.files?.[0];
    if (file) {
      const formData: FormData = new FormData();
      formData.append('file', file);
      this.httpService
        .uploadReportToStorage(formData, this.testReportsService.storageName)
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: () => this.loadData(),
        });
    }
    this.refresh();
  }

  copySelected(): void {
    const copiedIds: number[] = this.helperService.getSelectedIds(this.reports);
    const data: Record<string, number[]> = {
      [this.testReportsService.storageName]: copiedIds,
    };
    this.httpService
      .copyReport(data, this.testReportsService.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: () => this.loadData(),
      });
    this.testReportsService.getReports();
  }

  updatePath(): void {
    const reportIds: number[] = this.helperService.getSelectedIds(this.reports);
    if (reportIds.length > 0) {
      const path: string = this.transformPath(this.moveToInputModel.value);
      const map: UpdatePathSettings = { path: path, action: this.updatePathAction };
      this.httpService
        .updatePath(reportIds, this.testReportsService.storageName, map)
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: () => {
            this.loadData(path);
            this.matches();
            this.testReportsService.getReports();
            this.refresh();
          },
        });
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
