import { AfterViewInit, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { HttpService } from '../shared/services/http.service';
import { LoaderService } from '../shared/services/loader.service';
import { CloneModalComponent } from '../shared/components/modals/clone-modal/clone-modal.component';
import { TestSettingsModalComponent } from '../shared/components/modals/test-settings-modal/test-settings-modal.component';
import { TestResult } from '../shared/interfaces/test-result';
import { ReranReport } from '../shared/interfaces/reran-report';
import { Metadata } from '../shared/interfaces/metadata';
import { CookieService } from 'ngx-cookie-service';
import { TestFolderTreeComponent } from '../test-folder-tree/test-folder-tree.component';
import { catchError } from 'rxjs';
import { HelperService } from '../shared/services/helper.service';
import { HttpClient } from '@angular/common/http';
import { Report } from '../shared/interfaces/report';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit, OnDestroy {
  reports: Metadata[] = [];
  reranReports: ReranReport[] = [];
  generatorStatus: string = 'Disabled';
  currentFilter: string = '';
  TIMEOUT = 100;
  @Output() openTestReportEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;
  @ViewChild(TestFolderTreeComponent) testFolderTreeComponent!: TestFolderTreeComponent;

  constructor(
    private httpService: HttpService,
    private loaderService: LoaderService,
    private cookieService: CookieService
  ) {}

  openCloneModal(): void {
    this.cloneModal.open();
  }

  openSettingsModal(): void {
    this.testSettingsModal.open();
  }

  showStorageIds(): boolean {
    return this.cookieService.get('showReportStorageIds') === 'true';
  }

  ngOnInit(): void {
    if (!this.loaderService.isTestLoaded()) {
      this.loadData();
    } else {
      this.reports = this.loaderService.getTestReports();
      this.reranReports = this.loaderService.getReranReports();
      this.currentFilter = this.loaderService.getFolderFilter();
      this.getCopiedReports();
    }
    this.getGeneratorStatus();
  }

  getGeneratorStatus() {
    if (this.cookieService.get('generatorEnabled')) {
      this.generatorStatus = this.cookieService.get('generatorEnabled');
    } else {
      this.httpService.getSettings().subscribe((response) => {
        this.generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
        this.cookieService.set('generatorEnabled', this.generatorStatus);
      });
    }
  }

  addCopiedReports(metadata: Metadata[]): void {
    const amountAdded: number = metadata.length - this.reports.length;
    if (amountAdded > 0) {
      for (let index = this.reports.length; index <= metadata.length - 1; index++) {
        this.reports.push(metadata[index]);
      }
    }
  }

  getCopiedReports(): void {
    this.httpService.getTestReports().subscribe({
      next: (response) => this.addCopiedReports(response),
      error: () => catchError(this.httpService.handleError()),
    });
  }

  ngOnDestroy(): void {
    this.loaderService.saveTestSettings(this.reports, this.reranReports, this.currentFilter);
  }

  loadData(): void {
    this.httpService.getTestReports().subscribe({
      next: (value) => (this.reports = value),
      error: () => catchError(this.httpService.handleError()),
    });
  }

  resetRunner(): void {
    this.httpService.reset().subscribe();
    this.reranReports = [];
  }

  run(reportId: string): void {
    if (this.generatorStatus === 'Enabled') {
      const data: any = { testStorage: [reportId] };
      this.httpService.runReport(data).subscribe(() => this.timeOut());
    } else {
      this.toastComponent.addAlert({ type: 'warning', message: 'Generator is disabled!' });
    }
  }

  runAll(): void {
    if (this.generatorStatus === 'Enabled') {
      const data: any = { testStorage: [] };
      this.reports.filter((report) => report.checked).forEach((report) => data['testStorage'].push(report.storageId));
      this.httpService.runReport(data).subscribe(() => this.timeOut());
    } else {
      this.toastComponent.addAlert({ type: 'warning', message: 'Generator is disabled!' });
    }
  }

  timeOut(): void {
    setTimeout(() => this.queryResults(), 1000);
  }

  removeReranReportIfExists(id: string) {
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
      resultString: this.createResultString(result),
    };
  }

  createResultString(resultReport: TestResult) {
    return (
      '(' +
      resultReport.previousTime +
      'ms >> ' +
      resultReport.currentTime +
      'ms) (' +
      resultReport.stubbed +
      '/' +
      resultReport.total +
      ' stubbed)'
    );
  }

  showResult(result: TestResult) {
    const id: string = result.originalReport.storageId.toString();
    this.removeReranReportIfExists(id);
    const reranReport: ReranReport = this.createReranReport(result, id);
    this.reranReports.push(reranReport);
  }

  queryResults(): void {
    this.httpService.queryResults().subscribe((response) => {
      for (let result in response.results) {
        if (response.results.hasOwnProperty(result)) {
          this.showResult(response.results[result]);
        }
      }
    });
  }

  getReranReport(id: string): ReranReport {
    return <ReranReport>this.reranReports.find((report) => report.id == id);
  }

  openReport(storageId: string, name: string): void {
    this.httpService.getReport(storageId, 'testStorage').subscribe((data) => {
      let report: Report = data.report;
      report.xml = data.xml;
      this.openTestReportEvent.emit({ data: report, name: name });
    });
  }

  deleteSelected(): void {
    this.reports
      .filter((report) => report.checked)
      .forEach((report) => {
        this.httpService.deleteReport(report.storageId).subscribe();
        this.reports.splice(this.reports.indexOf(report), 1);
      });
  }

  downloadSelected(): void {
    const queryString: string = this.reports
      .filter((report) => report.checked)
      .reduce(
        (totalQuery: string, selectedReport: Metadata) => totalQuery + 'id=' + selectedReport.storageId + '&',
        '?'
      );
    window.open('api/report/download/testStorage/true/false' + queryString.slice(0, -1));
  }

  uploadReport(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData: any = new FormData();
      formData.append('file', file);
      this.httpService.uploadReportToStorage(formData).subscribe(() => this.loadData());
    }
  }

  compareReports(id: string): void {
    const reranReport = this.reranReports.find((report) => report.id === id);
    if (reranReport) {
      this.openCompareReportsEvent.emit({
        originalReport: reranReport.originalReport,
        runResultReport: reranReport.runResultReport,
      });
    }
  }

  replaceReport(reportId: string): void {
    console.log(reportId);
    this.httpService.replaceReport(reportId).subscribe(() => {
      this.reranReports = this.reranReports.filter((report) => report.id != reportId);
    });
  }

  copySelected() {
    let copiedIds: string[] = this.getIdsToBeCopied();
    this.httpService.copyReport({ testStorage: copiedIds }).subscribe(() => {
      this.loadData();
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

  getIdsToBeCopied(): string[] {
    let copiedIds: string[] = [];
    this.reports.forEach((report) => {
      if (report.checked) {
        copiedIds.push(report.storageId);
      }
    });

    return copiedIds;
  }

  copyAndMove() {
    let copiedIds: string[] = this.getIdsToBeCopied();

    this.httpService.copyReport({ testStorage: copiedIds }).subscribe((r: any) => {
      this.loadData();
      setTimeout(() => {
        this.reports.slice(r.length * -1).forEach((report) => (report.checked = true));
        this.moveTestReportToFolder();
      }, 200);
    });
  }

  moveTestReportToFolder(): void {
    let selectedReports = this.reports.filter((report) => report.checked);
    if (selectedReports.length > 0) {
      this.currentFilter = (document.querySelector('#moveToInput')! as HTMLInputElement).value;
      if (!this.currentFilter.startsWith('/')) {
        this.currentFilter = '/' + this.currentFilter;
      }
      this.testFolderTreeComponent.addFolder(this.currentFilter);
      this.changeMovedTestReportNames(selectedReports);
    } else {
      this.toastComponent.addAlert({ type: 'warning', message: 'No Report Selected!' });
    }
  }

  changeMovedTestReportNames(selectedReports: Metadata[]): void {
    selectedReports.forEach((report) => {
      if (report.name.split('/').length > 1) {
        let name = report.name.split('/').pop();
        report.name = (this.currentFilter + '/' + name).slice(1);
      } else {
        report.name = (this.currentFilter + '/' + report.name).slice(1);
      }
    });
    this.testFolderTreeComponent.removeUnusedFolders(this.reports);
    this.testFolderTreeComponent.updateTreeView();
  }

  changeFilter(filter: string): void {
    this.currentFilter = filter;
  }

  matches(name: string): boolean {
    return name.match(this.currentFilter + '/' + '.*') != undefined;
  }
}
