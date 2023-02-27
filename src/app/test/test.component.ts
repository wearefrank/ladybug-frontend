import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { HttpService } from '../shared/services/http.service';
import { CloneModalComponent } from './clone-modal/clone-modal.component';
import { TestSettingsModalComponent } from './test-settings-modal/test-settings-modal.component';
import { TestResult } from '../shared/interfaces/test-result';
import { ReranReport } from '../shared/interfaces/reran-report';
import { CookieService } from 'ngx-cookie-service';
import { TestFolderTreeComponent } from './test-folder-tree/test-folder-tree.component';
import { catchError } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { HelperService } from '../shared/services/helper.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit {
  reports: any[] = [];
  reranReports: ReranReport[] = [];
  generatorStatus: string = 'Disabled';
  currentFilter: string = '';
  currentView: any = {
    metadataNames: ['storageId', 'name', 'variables', 'path'],
    storageName: 'Test',
  }; // Hard-coded for now
  targetStorage: string = 'Debug';
  @Output() openReportInSeparateTabEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;
  @ViewChild(TestFolderTreeComponent) testFolderTreeComponent!: TestFolderTreeComponent;

  constructor(
    private httpService: HttpService,
    private cookieService: CookieService,
    private helperService: HelperService
  ) {}

  openCloneModal(): void {
    if (this.getSelectedReports().length !== 1) {
      this.toastComponent.addAlert({ type: 'warning', message: 'Make sure exactly one report is selected at a time' });
    } else {
      this.cloneModal.open(this.getSelectedReports()[0]);
    }
  }

  openSettingsModal(): void {
    this.testSettingsModal.open();
  }

  showStorageIds(): boolean {
    return this.cookieService.get('showReportStorageIds') === 'true';
  }

  ngOnInit(): void {
    this.loadData(null);
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

  addCopiedReports(metadata: any[]): void {
    const amountAdded: number = metadata.length - this.reports.length;
    if (amountAdded > 0) {
      for (let index = this.reports.length; index <= metadata.length - 1; index++) {
        this.reports.push(metadata[index]);
      }
    }
  }

  getCopiedReports(): void {
    this.httpService.getTestReports(this.currentView.metadataNames, this.currentView.storageName).subscribe({
      next: (response) => this.addCopiedReports(response),
      error: () => catchError(this.httpService.handleError()),
    });
  }

  loadData(path: any): void {
    this.httpService.getTestReports(this.currentView.metadataNames, this.currentView.storageName).subscribe({
      next: (value) => {
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
        .runReport(this.currentView.storageName, this.targetStorage, reportId)
        .subscribe((response: any) => {
          this.showResult(response);
        });
    } else {
      this.toastComponent.addAlert({ type: 'warning', message: 'Generator is disabled!' });
    }
  }

  runSelected(): void {
    this.getSelectedReports().forEach((report) => this.run(report.storageId));
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
      resultString: this.createResultString(result),
    };
  }

  createResultString(resultReport: TestResult): string {
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
    this.httpService.getReport(storageId, this.currentView.storageName).subscribe((data) => {
      let report: Report = data.report;
      report.xml = data.xml;
      this.openReportInSeparateTabEvent.emit({ data: report, name: name });
    });
  }

  deleteSelected(): void {
    this.getSelectedReports().forEach((report) => {
      this.httpService.deleteReport(report.storageId, this.currentView.storageName).subscribe(() => {
        this.reports.splice(this.reports.indexOf(report), 1);
        this.loadData('');
      });
    });
  }

  getSelectedReports(): any[] {
    return this.reports.filter((report) => report.checked);
  }

  downloadSelected(): void {
    if (this.getSelectedReports().length > 0) {
      const queryString: string = this.getSelectedReports().reduce(
        (totalQuery: string, selectedReport: any) => totalQuery + 'id=' + selectedReport.storageId + '&',
        ''
      );
      this.helperService.download(queryString, this.currentView.storageName, true, false);
    } else {
      this.toastComponent.addAlert({ type: 'warning', message: 'No Report Selected!' });
    }
  }

  uploadReport(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData: any = new FormData();
      formData.append('file', file);
      this.httpService.uploadReportToStorage(formData, this.currentView.storageName).subscribe(() => this.loadData(''));
    }
  }

  compareReports(id: string): void {
    const reranReport = this.reranReports.find((report: ReranReport) => report.id == id);
    if (reranReport) {
      this.openCompareReportsEvent.emit({
        originalReport: reranReport.originalReport,
        runResultReport: reranReport.runResultReport,
      });
    }
  }

  replaceReport(reportId: string): void {
    this.httpService.replaceReport(reportId, this.targetStorage).subscribe(() => {
      this.reranReports = this.reranReports.filter((report) => report.id != reportId);
    });
  }

  copySelected(): void {
    let copiedIds: string[] = this.getSelectedIds();
    let data: any = {};
    data[this.currentView.storageName] = copiedIds;
    this.httpService.copyReport(data, this.currentView.storageName).subscribe(() => {
      this.loadData(null);
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

  getSelectedIds(): string[] {
    let copiedIds: string[] = [];
    this.getSelectedReports().forEach((report) => copiedIds.push(report.storageId));
    return copiedIds;
  }

  updatePath(action: string) {
    let reportIds: string[] = this.getSelectedIds();
    if (reportIds.length > 0) {
      let path = (document.querySelector('#moveToInput')! as HTMLInputElement).value;
      if (!path.endsWith('/')) {
        path = path + '/';
      }
      if (!path.startsWith('/')) {
        path = '/' + path;
      }
      let map = { path: path, action: action };
      this.httpService.updatePath(reportIds, this.currentView.storageName, map).subscribe(() => {
        this.loadData(path);
      });
    } else {
      this.toastComponent.addAlert({ type: 'warning', message: 'No Report Selected!' });
    }
  }

  changeFilter(filter: string): void {
    this.currentFilter = filter;
    this.reports.forEach((report) => {
      report.checked = this.matches(report);
    });
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
}
