import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
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
  ],
})
export class TestComponent implements OnInit, AfterViewInit {
  static readonly ROUTER_PATH: string = 'test';
  reports?: TestListItem[];
  reranReports: ReranReport[] = [];
  generatorStatus?: string;
  currentFilter: string = '';
  metadataNames = ['storageId', 'name', 'path', 'description'];
  storageName = 'Test';
  updatePathAction: UpdatePathAction = 'move';
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
    this.getGeneratorStatus();
  }

  ngOnInit(): void {
    this.loadData('');
    this.getGeneratorStatus();
  }

  ngAfterViewInit(): void {
    this.loadData('');
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

  showStorageIds(): boolean {
    return localStorage.getItem('showReportStorageIds') === 'true';
  }

  getGeneratorStatus() {
    const generatorStatus = localStorage.getItem('generatorEnabled');
    if (generatorStatus) {
      this.generatorStatus = generatorStatus;
    } else {
      this.httpService.getSettings().subscribe({
        next: (response: OptionsSettings) => {
          this.generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
          localStorage.setItem('generatorEnabled', this.generatorStatus);
        },
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  addCopiedReports(metadata: any[]): void {
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

  loadData(path: string): void {
    this.httpService.getViews().subscribe({
      next: (views: View[]) => {
        const defaultView: View | undefined = views.find((view: View) => view.defaultView);
        console.log(defaultView);
        /*if (defaultView) {
          const selectedView: View = views[defaultViewKey];
          if (selectedView.storageName) {
            this.currentView.targetStorage = selectedView.storageName;
          }
        }*/
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.httpService.getTestReports(this.metadataNames, this.storageName).subscribe({
      next: (value: TestListItem[]) => {
        this.reports = this.sortByName(value);
        this.testFileTreeComponent.setData(this.reports);
        if (path) {
          setTimeout(() => {
            this.testFileTreeComponent.selectItem(path);
          });
        } else {
          setTimeout(() => {
            this.testFileTreeComponent.tree.selectItem(this.testFileTreeComponent.rootFolder.name);
          });
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  resetRunner(): void {
    this.reranReports = [];
  }

  run(reportId: number): void {
    if (this.generatorStatus === 'Enabled') {
      this.httpService.runReport(this.storageName, reportId).subscribe({
        next: (response: TestResult): void => this.showResult(response),
        error: () => catchError(this.errorHandler.handleError()),
      });
    } else {
      this.toastService.showWarning('Generator is disabled!');
    }
  }

  runSelected(): void {
    for (const report of this.getSelectedReports()) {
      this.run(report.storageId);
    }
  }

  removeReranReportIfExists(id: number): void {
    this.reranReports = this.reranReports.filter((report) => report.id != id);
  }

  createReranReport(result: TestResult, id: number): ReranReport {
    let originalReport: Report = result.originalReport;
    let runResultReport: Report = result.runResultReport;

    originalReport.xml = result.originalXml;
    runResultReport.xml = result.runResultXml;

    return {
      id: id,
      originalReport: result.originalReport,
      runResultReport: result.runResultReport,
      color: result.equal ? 'green' : 'red',
      resultString: result.info,
    };
  }

  showResult(result: TestResult): void {
    const id: number = result.originalReport.storageId;
    this.removeReranReportIfExists(id);
    const reranReport: ReranReport = this.createReranReport(result, id);
    this.reranReports.push(reranReport);
  }

  getReranReport(id: number): ReranReport | undefined {
    return this.reranReports.find((report: ReranReport) => report.id == id);
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
        next: () => this.loadData(''),
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
        next: () => this.loadData(''),
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
        next: () => this.loadData(''),
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  toggleCheck(report: any): void {
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
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
        let path: string = this.moveToInputModel.value;
        path = this.transformPath(path);
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
      filter = filter === this.testFileTreeComponent.rootFolder.name ? '' : this.transformPath(filter);
      this.currentFilter = filter;
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

  matches(report: any): boolean {
    let name = report.path + report.name;
    return name.match(`(/)?${this.currentFilter}.*`) != undefined;
  }

  extractVariables(variables: string): string {
    if (!variables || variables == 'null') {
      return '';
    }
    let map = variables.split('\n');
    let keys = map[0].split(',');
    let values = map[1].split(',');
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
