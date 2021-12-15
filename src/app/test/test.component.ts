import {Component, OnInit, EventEmitter, Output, ViewChild, AfterViewInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastComponent} from "../shared/components/toast/toast.component";
import {HttpService} from "../shared/services/http.service";
import {LoaderService} from "../shared/services/loader.service";
import {CloneModalComponent} from "../shared/components/modals/clone-modal/clone-modal.component";
import {TestSettingsModalComponent} from "../shared/components/modals/test-settings-modal/test-settings-modal.component";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit, AfterViewInit {
  reports: any[] = [];
  reranReports: any[] = [];
  STORAGE_ID_INDEX = 5;
  NAME_INDEX = 2;
  TIMEOUT = 100;
  @Output() openTestReportEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(CloneModalComponent) cloneModal!: CloneModalComponent;
  @ViewChild(TestSettingsModalComponent) testSettingsModal!: TestSettingsModalComponent;

  constructor(private httpService: HttpService, private loaderService: LoaderService) {}

  openCloneModal(): void {
    this.cloneModal.open();
  }

  openSettingsModal(): void {
    this.testSettingsModal.open()
  }

  ngOnInit(): void {
    if (!this.loaderService.isTestLoaded()) {
      this.loadData();
    } else {
      this.reports = this.loaderService.getTestReports();
      this.reranReports = this.loaderService.getReranReports();
      this.getCopiedReports();
    }
  }

  ngAfterViewInit() {
    this.reranReports.forEach(report => {
      this.showResults(report.result, report.originalIndex);
    })
  }

  addCopiedReports(httpResponse: any): void {
    const amountAdded = httpResponse.values.length - this.reports.length
    if (amountAdded > 0) {
      for (let i = this.reports.length; i <= httpResponse.values.length - 1; i++) {
        this.reports.push(httpResponse.values[i])
      }
    }
  }

  getCopiedReports(): void {
    this.httpService.getTestReports().subscribe({
      next: response => this.addCopiedReports(response),
      error: () => this.httpService.handleError('Could not retrieve data for test!')
    })
  }

  ngOnDestroy(): void {
    this.loaderService.saveTestSettings(this.reports, this.reranReports)
  }

  loadData(): void {
    this.httpService.getTestReports().subscribe({
      next: value => this.reports = value.values,
      error: () => this.httpService.handleError('Could not retrieve data for test!')
    })
  }

  resetRunner(): void {
    this.httpService.reset().subscribe()
  }

  run(reportId: string): void {
    const data: any = {'testStorage': [reportId]}
    this.httpService.runReport(data).subscribe(() => this.timeOut())
  }

  runAll(): void {
    const data: any = {'testStorage': []}
    this.reports.filter(report => report.checked)
      .forEach(report => data['testStorage'].push(report[this.STORAGE_ID_INDEX]))
    this.httpService.runReport(data).subscribe(() => this.timeOut())
  }

  timeOut(): void {
    setTimeout(() => this.queryResults(), this.TIMEOUT)
  }

  queryResults(): void {
    this.httpService.queryResults().subscribe(response => {
      for (let oldReportIndex in response.results) {
        if (response.results.hasOwnProperty(oldReportIndex)) {
          this.showResults(response.results[oldReportIndex], oldReportIndex)
        }
      }
    })
  }

  testReportRan(id: string) {
    return this.reranReports.filter(report => report.originalIndex == id).length > 0;
  }

  showResults(resultReport: any, oldReportIndex: string) {
    let testReportElement = document.getElementById("testReport#" + oldReportIndex);
    if (testReportElement) {
      this.appendResultToTestReport(resultReport, oldReportIndex, testReportElement)
    }
  }

  appendResultToTestReport(resultReport: any, oldReportIndex: string, testReportElement: HTMLElement) {
    let newResultElement = this.createNewResultElement(resultReport, oldReportIndex)
    let existingResultElement = document.getElementById("resultElement#" + oldReportIndex)

    if (existingResultElement) {
      this.replaceElement(testReportElement, newResultElement, existingResultElement, oldReportIndex)
    } else {
      this.addElement(testReportElement, newResultElement)
    }

    this.reranReports.push({originalIndex: oldReportIndex, newIndex: resultReport.report.storageId, result: resultReport});
  }

  createNewResultElement(resultReport: any, oldReportIndex: string) {
    let originalReport = this.getOriginalReport(oldReportIndex);
    return this.createElement(resultReport, oldReportIndex, originalReport);
  }

  getOriginalReport(reportId: string) {
    return this.httpService.getReport(reportId).subscribe(report => report)
  }

  replaceElement(parentElement: HTMLElement, newElement: HTMLElement, oldElement: HTMLElement, oldReportIndex: string) {
    this.reranReports = this.reranReports.filter(report => report.originalIndex != oldReportIndex)
    parentElement.replaceChild(newElement, oldElement)
  }

  addElement(parentElement: HTMLElement, newElement: HTMLElement) {
    parentElement.appendChild(newElement);
  }

  createElement(resultReport: any, reportIndex: string, originalReport: any) {
    const tdElement = document.createElement('td')
    tdElement.appendChild(document.createTextNode("("
      + resultReport['previous-time'] + "ms >> "
      + resultReport['current-time'] + "ms) ("
      + resultReport['stubbed'] + "/"
      + resultReport['total'] + " stubbed)"
    ))
    tdElement.setAttribute('id', 'resultElement#' + reportIndex)

    // If the reports are not equal, then a reportIndex color should be shown
    const color = originalReport == resultReport.report ? 'green' : 'red'
    tdElement.setAttribute('style', 'color:' + color)
    return tdElement;
  }

  selectReport(storageId: number, name: string): void {
    this.httpService.getReport(storageId.toString())
      .subscribe(data => this.openTestReportEvent.emit({data: data, name: name}))
  }

  deleteSelected(): void {
    this.reports.filter(report => report.checked)
      .forEach(report => this.httpService.deleteReport(report[this.STORAGE_ID_INDEX]).subscribe())
    setTimeout(() => this.loadData(), this.TIMEOUT)
  }

  downloadSelected(exportMessages: boolean, exportReports: boolean): void {
    const queryString = this.reports.filter(report => report.checked)
      .reduce((totalQuery: string, selectedReport: string[]) => totalQuery + "id=" + selectedReport[this.STORAGE_ID_INDEX] + "&", "?")
    window.open('api/report/download/testStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));
  }

  uploadReport(event: any): void {
    const file: File = event.target.files[0]
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      this.httpService.uploadReport(formData).subscribe(() => this.loadData())
    }
  }

  compareReports(originalReport: string): void {
    let newReport = this.reranReports.filter(report => report.originalIndex == originalReport)[0].reran;
    this.openCompareReportsEvent.emit({oldReport: originalReport, newReport: newReport})
  }

  replaceReport(reportId: string): void {
    this.httpService.replaceReport(reportId).subscribe(() => {
      this.reranReports = this.reranReports.filter(report => report.originalIndex != reportId)
    })
  }

  toggleCheck(report: any): void {
    report.checked = !report.checked
  }

  checkAll(): void {
    this.reports.map(report => report.checked = true)
  }

  uncheckAll(): void {
    this.reports.map(report => report.checked = false)
  }
}
