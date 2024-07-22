import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../shared/services/http.service';
import { CloneModalComponent } from './clone-modal/clone-modal.component';
import { TestSettingsModalComponent } from './test-settings-modal/test-settings-modal.component';
import { TestResult } from '../shared/interfaces/test-result';
import { ReranReport } from '../shared/interfaces/reran-report';
import { catchError } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { HelperService } from '../shared/services/helper.service';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { ToastService } from '../shared/services/toast.service';
import { TabService } from '../shared/services/tab.service';
import { UpdatePathSettings } from '../shared/interfaces/update-path-settings';
import { ReportData } from '../shared/interfaces/report-data';
import { TestFolderTreeComponent } from './test-folder-tree/test-folder-tree.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../shared/components/button/button.component';
import { TestListItem } from '../shared/interfaces/test-list-item';
import { View } from '../shared/interfaces/view';
import { OptionsSettings } from '../shared/interfaces/options-settings';
import { ErrorHandling } from '../shared/classes/error-handling.service';
import { BooleanToStringPipe } from '../shared/pipes/boolean-to-string.pipe';

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
  ],
})
export class TestComponent implements OnInit {
  static readonly ROUTER_PATH: string = 'test';
  reports?: TestListItem[];
  reranReports: ReranReport[] = [];
  generatorEnabled?: boolean;
  currentFilter: string = '';
  metadataNames: string[] = ['storageId', 'name', 'path', 'description', 'variables'];
  storageName: string = 'Test';
  updatePathAction: UpdatePathAction = 'move';
  showStorageIds?: boolean;
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;
  @ViewChild(DeleteModalComponent) deleteModal!: DeleteModalComponent;
  @ViewChild(TestFolderTreeComponent) testFileTreeComponent!: TestFolderTreeComponent;
  @ViewChild('moveToInput', { read: NgModel }) moveToInputModel!: NgModel;
  amountOfSelectedReports: number = 0;

  constructor(
    private httpService: HttpService,
    private helperService: HelperService,
    private toastService: ToastService,
    private tabService: TabService,
    private errorHandler: ErrorHandling,
  ) {
    this.setStorageIdsFromLocalStorage();
    this.setGeneratorStatusFromLocalStorage();
  }

  ngOnInit(): void {
    this.loadData();
  }

  setStorageIdsFromLocalStorage(): void {
    this.showStorageIds = localStorage.getItem('showReportStorageIds') === 'true';
  }

  setGeneratorStatusFromLocalStorage() {
    const generatorStatus: string | null = localStorage.getItem('generatorEnabled');
    if (generatorStatus) {
      this.generatorEnabled = generatorStatus === 'true';
    } else {
      this.httpService.getSettings().subscribe({
        next: (response: OptionsSettings) => {
          console.log(response);
          this.generatorEnabled = response.generatorEnabled;
          localStorage.setItem('generatorEnabled', String(this.generatorEnabled));
        },
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  loadData(path?: string): void {
    this.httpService.getTestReports(this.metadataNames, this.storageName).subscribe({
      next: (value: TestListItem[]) => {
        this.reports = this.sortByName(value);
        this.testFileTreeComponent.setData(this.reports);
        this.setCheckedForAllReports(true);
        this.amountOfSelectedReports = value.length;
        if (path) {
          this.testFileTreeComponent.selectItem(path);
        } else {
          this.testFileTreeComponent.selectItem(this.testFileTreeComponent.rootFolder.name);
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  openCloneModal(): void {
    if (this.reports) {
      if (this.getSelectedReports().length === 1) {
        this.cloneModal.open(this.getSelectedReports()[0]);
      } else {
        this.toastService.showWarning('Make sure exactly one report is selected at a time');
      }
    }
  }

  openSettingsModal(): void {
    this.testSettingsModal.open();
  }

  addCopiedReports(metadata: TestListItem[]): void {
    if (this.reports) {
      const amountAdded: number = metadata.length - this.reports.length;
      if (amountAdded > 0) {
        for (let index = this.reports.length; index <= metadata.length - 1; index++) {
          if (this.matches(metadata[index])) metadata[index].checked = true;
          this.reports.push(metadata[index]);
        }
      }
    }
  }

  getCopiedReports(): void {
    this.httpService.getTestReports(this.metadataNames, this.storageName).subscribe({
      next: (response: TestListItem[]) => this.addCopiedReports(response),
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  resetRunner(): void {
    this.reranReports = [];
  }

  run(report: TestListItem): void {
    if (this.generatorEnabled) {
      this.httpService.runReport(this.storageName, report.storageId).subscribe({
        next: (response: TestResult): void => {
          report.reranReport = this.createReranReport(response);
        },
        error: () => catchError(this.errorHandler.handleError()),
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
    let originalReport: Report = result.originalReport;
    let runResultReport: Report = result.runResultReport;

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

  getReranReport(id: number): ReranReport | undefined {
    return this.reranReports.find((report: ReranReport) => report.id === id);
  }

  openReport(storageId: number, name: string): void {
    this.httpService.getReport(storageId, this.storageName).subscribe({
      next: (report: Report): void => {
        const reportData: ReportData = {
          report: report,
          currentView: { storageName: this.storageName, metadataNames: this.metadataNames } as View,
        };
        this.tabService.openNewTab(reportData);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  openDeleteModal(): void {
    const reportsToBeDeleted: TestListItem[] = this.getSelectedReports();
    if (reportsToBeDeleted.length > 0) {
      this.deleteModal.open(reportsToBeDeleted);
    }
  }

  deleteSelected(): void {
    if (this.reports) {
      this.httpService.deleteReport(this.helperService.getSelectedIds(this.reports), this.storageName).subscribe({
        next: () => this.loadData(),
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  downloadSelected(): void {
    const selectedReports: TestListItem[] = this.getSelectedReports();
    if (selectedReports.length > 0) {
      let queryString: string = '';
      for (let report of selectedReports) {
        queryString += `id=${report.storageId}&`;
      }
      this.helperService.download(queryString, this.storageName, true, false);
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
      this.httpService.uploadReportToStorage(formData, this.storageName).subscribe({
        next: () => this.loadData(),
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  compareReports(id: number): void {
    const reranReport = this.reranReports.find((report: ReranReport) => report.id == id);
    if (reranReport) {
      const tabId: string = this.helperService.createCompareTabId(
        reranReport?.originalReport,
        reranReport?.runResultReport,
      );
      this.tabService.openNewCompareTab({
        id: tabId,
        viewName: 'compare',
        originalReport: reranReport.originalReport,
        runResultReport: reranReport.runResultReport,
      });
    }
  }

  replaceReport(reportId: number): void {
    this.httpService.replaceReport(reportId, this.storageName).subscribe({
      next: () => {
        this.reranReports = this.reranReports.filter((report: ReranReport) => report.id != reportId);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  copySelected(): void {
    if (this.reports) {
      const copiedIds: number[] = this.helperService.getSelectedIds(this.reports);
      const data: Record<string, number[]> = {
        [this.storageName]: copiedIds,
      };
      this.httpService.copyReport(data, this.storageName).subscribe({
        next: () => this.loadData(),
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  toggleCheck(report: TestListItem): void {
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
    }
  }

  toggleSelectAll(): void {
    if (this.reports) {
      if (this.amountOfSelectedReports === this.reports.length) {
        this.setCheckedForAllReports(false);
        this.amountOfSelectedReports = 0;
      } else {
        this.setCheckedForAllReports(true);
        this.amountOfSelectedReports = this.reports.length;
      }
    }
  }

  setCheckedForAllReports(value: boolean) {
    if (this.reports) {
      for (const report of this.reports) {
        report.checked = value;
      }
    }
  }

  updatePath(): void {
    if (this.reports) {
      const reportIds: number[] = this.helperService.getSelectedIds(this.reports);
      if (reportIds.length > 0) {
        const path: string = this.transformPath(this.moveToInputModel.value);
        const map: UpdatePathSettings = { path: path, action: this.updatePathAction };
        this.httpService.updatePath(reportIds, this.storageName, map).subscribe({
          next: () => this.loadData(path),
          error: () => catchError(this.errorHandler.handleError()),
        });
      } else {
        this.toastService.showWarning('No Report Selected!');
      }
    }
  }

  setUpdatePathAction(value: UpdatePathAction): void {
    this.updatePathAction = value;
  }

  changeFilter(filter: string): void {
    if (this.reports) {
      const transformedFilter: string =
        filter === this.testFileTreeComponent.rootFolder.name ? '' : this.transformPath(filter);
      this.currentFilter = transformedFilter;
      for (const report of this.reports) {
        report.checked = this.matches(report);
      }
    }
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

  matches(report: TestListItem): boolean {
    const name = report.path + report.name;
    return new RegExp(`(/)?${this.currentFilter}.*`).test(name);
  }

  extractVariables(variables: string): string {
    if (!variables || variables == 'null') {
      return '';
    }
    const map = variables.split('\n');
    const keys = map[0].split(',');
    const values = map[1].split(',');
    let resultString = '';
    for (let i in keys) {
      resultString += keys[i] + '=' + values[i] + ', ';
    }
    return resultString.slice(0, -2);
  }

  sortByName(reports: TestListItem[]): TestListItem[] {
    return reports.sort((a, b) => (a.name > b.name ? 1 : a.name === b.name ? 0 : -1));
  }

  getFullPath(path: string, name: string): string {
    if (path) {
      return `${path.replace(this.currentFilter, '')}${name}`;
    }
    return `/${name}`;
  }

  getSelectedReports(): TestListItem[] {
    return this.reports?.filter((item: TestListItem) => item.checked) ?? [];
  }
}
