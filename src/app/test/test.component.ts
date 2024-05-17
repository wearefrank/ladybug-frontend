import { AfterViewInit, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { HttpService } from '../shared/services/http.service';
import { CloneModalComponent } from './clone-modal/clone-modal.component';
import { TestSettingsModalComponent } from './test-settings-modal/test-settings-modal.component';
import { TestResult } from '../shared/interfaces/test-result';
import { ReranReport } from '../shared/interfaces/reran-report';
import { TestFolderTreeComponent } from './test-folder-tree/test-folder-tree.component';
import { catchError } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { HelperService } from '../shared/services/helper.service';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';
import { ToastService } from '../shared/services/toast.service';
import { TabService } from '../shared/services/tab.service';
import { UpdatePathSettings } from '../shared/interfaces/update-path-settings';
import { View } from '../shared/interfaces/view';
import { TestListItem } from '../shared/interfaces/test-list-item';
import { CurrentTestView } from '../shared/interfaces/current-test-view';
import { CompareReport } from '../shared/interfaces/compare-report';
import { OptionsSettings } from '../shared/interfaces/options-settings';
import { TargetWithFiles } from '../shared/interfaces/target-with-files';
import { ReportData } from '../shared/interfaces/report-data';
import { NodeLinkStrategy } from '../shared/enums/compare-method';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit, AfterViewInit {
  static readonly ROUTER_PATH: string = 'test';
  reports: TestListItem[] = [];
  reranReports: ReranReport[] = [];
  generatorStatus: string = 'Disabled';
  currentFilter: string = '';
  currentView: CurrentTestView = {
    metadataNames: ['storageId', 'name', 'path'],
    storageName: 'Test',
    targetStorage: '',
  };
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent)
  testSettingsModal!: TestSettingsModalComponent;
  @ViewChild(TestFolderTreeComponent)
  testFolderTreeComponent!: TestFolderTreeComponent;
  @ViewChild(DeleteModalComponent) deleteModal!: DeleteModalComponent;

  constructor(
    private httpService: HttpService,
    private helperService: HelperService,
    private toastService: ToastService,
    private tabService: TabService,
  ) {}

  ngAfterViewInit(): void {
    this.loadData('');
  }

  openCloneModal(): void {
    if (this.helperService.getSelectedReports(this.reports).length === 1) {
      this.cloneModal.open(this.helperService.getSelectedReports(this.reports)[0]);
    } else {
      this.toastService.showWarning('Make sure exactly one report is selected at a time');
    }
  }

  openSettingsModal(): void {
    this.testSettingsModal.open();
  }

  showStorageIds(): boolean {
    return localStorage.getItem('showReportStorageIds') === 'true';
  }

  ngOnInit(): void {
    this.loadData('');
    this.getGeneratorStatus();
  }

  getGeneratorStatus() {
    if (localStorage.getItem('generatorEnabled')) {
      this.generatorStatus = localStorage.getItem('generatorEnabled')!;
    } else {
      this.httpService.getSettings().subscribe((response: OptionsSettings) => {
        this.generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
        localStorage.setItem('generatorEnabled', this.generatorStatus);
      });
    }
  }

  addCopiedReports(metadata: any[]): void {
    const amountAdded: number = metadata.length - this.reports.length;
    if (amountAdded > 0) {
      for (let index = this.reports.length; index <= metadata.length - 1; index++) {
        if (this.matches(metadata[index])) metadata[index].checked = true;
        this.reports.push(metadata[index]);
      }
    }
  }

  getCopiedReports(): void {
    this.httpService.getTestReports(this.currentView.metadataNames, this.currentView.storageName).subscribe({
      next: (response: TestListItem[]) => this.addCopiedReports(response),
      error: () => catchError(this.httpService.handleError()),
    });
  }

  loadData(path: string): void {
    this.httpService.getViews().subscribe((views: Record<string, View>) => {
      const defaultViewKey: string | undefined = Object.keys(views).find((view: string) => views[view].defaultView);
      if (defaultViewKey) {
        const selectedView: View = views[defaultViewKey];
        if (selectedView.storageName) {
          this.currentView.targetStorage = selectedView.storageName;
        }
      }
    });
    this.httpService.getTestReports(this.currentView.metadataNames, this.currentView.storageName).subscribe({
      next: (value: TestListItem[]) => {
        this.reports = value;
        this.testFolderTreeComponent.updateFolderTree(this.reports, path);
      },
      error: () => catchError(this.httpService.handleError()),
    });
  }

  resetRunner(): void {
    this.httpService.reset().subscribe();
    this.reranReports = [];
  }

  run(reportId: string): void {
    if (this.generatorStatus === 'Enabled') {
      this.httpService
        .runReport(this.currentView.storageName, this.currentView.targetStorage, reportId)
        .subscribe((response: TestResult) => {
          this.showResult(response);
        });
    } else {
      this.toastService.showWarning('Generator is disabled!');
    }
  }

  runSelected(): void {
    this.helperService.getSelectedReports(this.reports).forEach((report) => this.run(report.storageId));
  }

  removeReranReportIfExists(id: string): void {
    this.reranReports = this.reranReports.filter((report) => report.id != id);
  }

  createReranReport(result: TestResult, id: string): ReranReport {
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
    const id: string = result.originalReport.storageId.toString();
    this.removeReranReportIfExists(id);
    const reranReport: ReranReport = this.createReranReport(result, id);
    this.reranReports.push(reranReport);
  }

  getReranReport(id: string): ReranReport {
    return <ReranReport>this.reranReports.find((report) => report.id == id);
  }

  openReport(storageId: string, name: string): void {
    // this.httpService.getReport(storageId, this.currentView.storageName).subscribe((data: CompareReport) => {
    //   const report: Report = data.report;
    //   report.xml = data.xml;
    //   this.tabService.openNewTab({ data: report, name: name });
    // });

    this.httpService.getReport(storageId, this.currentView.storageName).subscribe((report: Report): void => {
      const reportData: ReportData = {
        report: report,
        currentView: this.currentView,
      };
      this.tabService.openNewTab(reportData);
    });
  }

  openDeleteModal() {
    let reportsToBeDeleted = this.helperService.getSelectedReports(this.reports);
    if (reportsToBeDeleted.length > 0) {
      this.deleteModal.open(reportsToBeDeleted);
    }
  }

  deleteSelected(): void {
    this.httpService
      .deleteReport(this.helperService.getSelectedIds(this.reports), this.currentView.storageName)
      .subscribe(() => {
        this.loadData('');
      });
  }

  downloadSelected(): void {
    const selectedReports = this.helperService.getSelectedReports(this.reports);
    if (selectedReports.length > 0) {
      const queryString: string = selectedReports.reduce(
        (totalQuery: string, selectedReport: any) => totalQuery + 'id=' + selectedReport.storageId + '&',
        '',
      );
      this.helperService.download(queryString, this.currentView.storageName, true, false);
    } else {
      this.toastService.showWarning('No Report Selected!');
    }
  }

  uploadReport(event: Event): void {
    const eventTarget = event.target as HTMLInputElement;
    const file: FileList | null = eventTarget.files;
    if (file) {
      const formData: FormData = new FormData();
      formData.append('file', file[0]);
      this.httpService.uploadReportToStorage(formData, this.currentView.storageName).subscribe(() => this.loadData(''));
    }
  }

  compareReports(id: string): void {
    const reranReport = this.reranReports.find((report: ReranReport) => report.id == id);
    if (reranReport) {
      this.tabService.openNewCompareTab({
        originalReport: reranReport.originalReport,
        runResultReport: reranReport.runResultReport,
      });
    }
  }

  replaceReport(reportId: string): void {
    this.httpService.replaceReport(reportId, this.currentView.targetStorage).subscribe(() => {
      this.reranReports = this.reranReports.filter((report: ReranReport) => report.id != reportId);
    });
  }

  copySelected(): void {
    const copiedIds: string[] = this.helperService.getSelectedIds(this.reports);
    const parsedIdCopies: number[] = copiedIds.map(Number);
    const data: Record<string, number[]> = {};
    data[this.currentView.storageName] = parsedIdCopies;
    this.httpService.copyReport(data, this.currentView.storageName).subscribe(() => {
      this.loadData('');
    });
  }

  toggleCheck(report: any): void {
    report.checked = !report.checked;
  }

  checkAll(): void {
    this.reports.forEach((report) => (report.checked = true));
  }

  uncheckAll(): void {
    this.reports.forEach((report) => (report.checked = false));
  }

  updatePath(action: string) {
    const reportIds: string[] = this.helperService.getSelectedIds(this.reports);
    if (reportIds.length > 0) {
      let path = (document.querySelector('#moveToInput')! as HTMLInputElement).value;
      path = this.transformPath(path);
      const map: UpdatePathSettings = { path: path, action: action };
      this.httpService.updatePath(reportIds, this.currentView.storageName, map).subscribe(() => this.loadData(path));
    } else {
      this.toastService.showWarning('No Report Selected!');
    }
  }

  changeFilter(filter: string): void {
    this.currentFilter = filter;
    this.reports.forEach((report) => {
      report.checked = this.matches(report);
    });
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
    return name.match('(/)?' + this.currentFilter + '.*') != undefined;
  }

  showRelativePath(path: string) {
    if (path) {
      return path.replace(this.currentFilter, '');
    }
    return '/';
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

  sortByName() {
    return this.reports.sort((a, b) => (a.name > b.name ? 1 : a.name === b.name ? 0 : -1));
  }
}
