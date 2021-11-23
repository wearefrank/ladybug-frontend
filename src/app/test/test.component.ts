import {Component, OnInit, EventEmitter, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastComponent} from "../shared/components/toast/toast.component";
import {HttpService} from "../shared/services/http.service";

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit{
  reports: any[] = [];
  metadata: any = {};
  reranReports: any[] = [];
  reranReportsIndex: string[] = [];
  @Output() openTestReportEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  open(content: any) {
    this.modalService.open(content);
  }

  ngOnInit() {
    this.loadData();
  }

  /**
   * Load in the report data from testStorage
   */
  loadData() {
    this.httpService.getTestReports(this.toastComponent).then(data => {
      this.reports = data.values;
    })
  }

  /**
   * Reset the runner
   */
  resetRunner() {
    // @ts-ignore
    this.httpService.reset()
  }

  /**
   * Run a test
   */
  run(reportId: string) {
    let data: any = {}
    data['testStorage'] = [reportId]

    this.httpService.runReport(data, this.toastComponent).then(() => {
      this.queryResults()
    })
  }

  /**
   * Runs all tests
   */
  runAll() {
    let selectedReports = this.reports.filter(report => report.checked);
    let data: any = {}
    data['testStorage'] = []
    for (let i = 0; i < selectedReports.length; i++) {
      data['testStorage'].push(selectedReports[i][5])
    }

    this.httpService.runReport(data, this.toastComponent).then(() => {
      this.queryResults();
    })
  }

  /**
   * Query the results of the test run
   */
  async queryResults() {
    this.httpService.queryResults(this.toastComponent).then(response => {

      // Retrieve each report in the result runner
      for (let result in response.results) {
        if (response.results.hasOwnProperty(result)) {
          this.httpService.getReport(result, this.toastComponent).then(report => {

            // For each report, show the results
            let element = document.getElementById('testReport#' + result)
            if (element) {
              let td = document.createElement('td')
              let res = response.results[result];
              td.appendChild(document.createTextNode("(" + res['previous-time'] + "ms >> " + res['current-time'] + "ms) (" + res['stubbed'] + "/" + res['total'] + " stubbed)"))

              // If the reports are not equal, then a different color should be shown
              let color = report == response.results[result].report ? 'green' : 'red'
              td.setAttribute('style', 'color:' + color)
              if (element.childElementCount > 5 && element.lastChild != null) {
                element.removeChild(element.lastChild)
              }
              element.appendChild(td)

              // Make sure only 1 result is shown and they don't append
              let rerunIndex = this.reranReports.findIndex(x => x.original == result);
              if (rerunIndex !== -1) {
                this.reranReports.splice(rerunIndex, 1);
                this.reranReportsIndex.splice(rerunIndex, 1)
              }
              this.reranReports.push({original: result, reran: response.results[result].report.storageId});
              this.reranReportsIndex.push(result)
            }
          })
        }
      }
    })
  }

  /**
   * Selects the report to be displayed
   * @param storageId - the storageId of the report
   * @param name - the name of the report
   */
  selectReport(storageId: number, name: string) {
    this.httpService.getReport(storageId.toString(), this.toastComponent).then(data => {
      this.openTestReportEvent.emit({data: data, name: name})
    })
  }

  /**
   * Removes the selected reports
   */
  deleteSelected() {
    let selectedReports = this.reports.filter(report => report.checked);
    for (let i = 0; i < selectedReports.length; i++) {
      this.httpService.deleteReport(selectedReports[i][5], this.toastComponent).then(() => {
        this.loadData();
      })
    }
  }

  /**
   * Download selected reports
   * @param exportMessages - boolean whether to download messages
   * @param exportReports = boolean whether to download reports
   */
  downloadSelected(exportMessages: boolean, exportReports: boolean) {
    let selectedReports = this.reports.filter(report => report.checked);
    let queryString = "?";
    for (let i = 0; i < selectedReports.length; i++) {
        queryString += "id=" + selectedReports[i][5] + "&"
    }
    window.open('api/report/download/testStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));

  }

  /**
   * Upload a report
   * @param event - the target file to upload
   */
  uploadReport(event: any) {
    const file: File = event.target.files[0]
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      this.httpService.uploadReport(formData, this.toastComponent).then(() => {
        this.loadData()
      })
    }
  }

  /**
   * Compare two reports with each other in compare tab
   * @param originalReport - the original report that will be compared to the new one
   */
  compareReports(originalReport: string) {
    let index = this.reranReportsIndex.indexOf(originalReport);
    let newReport = this.reranReports[index].reran;
    this.openCompareReportsEvent.emit({oldReport: originalReport, newReport: newReport})
  }

  /**
   * Replace the original report
   * @param reportId - report that will be replaced
   */
  replaceReport(reportId: string) {
    this.httpService.replaceReport(reportId, this.toastComponent).then(() => {
      let index = this.reranReportsIndex.indexOf(reportId);
      this.reranReportsIndex.splice(index, 1);
      this.reranReports.splice(index, 1);
    })
  }

  /**
   * Toggle the checkbox
   * @param report - the report that is toggled
   */
  toggleCheck(report: any) {
    let index = this.reports.indexOf(report);
    this.reports[index].checked = !report.checked
  }

  /**
   * Checks all checkboxes
   */
  checkAll() {
    for (let report of this.reports) {
      report.checked = true;
    }
  }

  /**
   * Unchecks all checkboxes
   */
  uncheckAll() {
    for (let report of this.reports) {
      report.checked = false;
    }
  }
}
