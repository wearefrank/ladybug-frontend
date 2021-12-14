import {Component, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
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
export class TestComponent implements OnInit{
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
      for (let reportIndex in response.results) {
        if (response.results.hasOwnProperty(reportIndex)) {
          this.showResults(reportIndex, response)
        }
      }
    })
  }

  testReportRan(id: string) {
    return this.reranReports.filter(report => report.original == id).length > 0;
  }

  showResults(reportIndex: string, queryResponse: any) {
    let testReportElement = document.getElementById("testReport#" + reportIndex);
    if (testReportElement) {
      let originalReport = this.getOriginalReport(reportIndex);
      let newReport = queryResponse.results[reportIndex];

      let newResultElement = this.createElement(newReport, reportIndex, originalReport);
      let existingResultElement = document.getElementById("resultElement#" + reportIndex)

      if (existingResultElement) {
        this.reranReports = this.reranReports.filter(report => report.original != reportIndex)
        this.replaceElement(testReportElement, newResultElement, existingResultElement)
      } else {
        this.addElement(testReportElement, newResultElement)
      }
      this.reranReports.push({original: reportIndex, reran: newReport.report.storageId});
    }
  }

  getOriginalReport(reportId: string) {
    return this.httpService.getReport(reportId).subscribe(report => report)
  }

  replaceElement(parentElement: HTMLElement, newElement: HTMLElement, oldElement: HTMLElement) {
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
    let newReport = this.reranReports.filter(report => report.original == originalReport)[0].reran;
    this.openCompareReportsEvent.emit({oldReport: originalReport, newReport: newReport})
  }

  replaceReport(reportId: string): void {
    this.httpService.replaceReport(reportId).subscribe(() => {
      this.reranReports = this.reranReports.filter(report => report.original != reportId)
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
