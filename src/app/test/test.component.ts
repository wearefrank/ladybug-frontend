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
  STORAGE_ID_INDEX = 5;
  NAME_INDEX = 2;
  TIMEOUT = 100;
  @Output() openTestReportEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  open(content: any) {
    this.modalService.open(content);
  }

  ngOnInit(): void {
    this.loadData();
  }

  /**
   * Load in the report data from testStorage
   */
  loadData(): void {
    this.httpService.getTestReports().subscribe({
      next: value => {
        this.reports = value.values
        this.toastComponent.addAlert({type: 'success', message: 'Test data retrieved'})
      }, error: () => {
        this.toastComponent.addAlert({type: 'danger', message: 'Could not retrieve data for test!'})
      }
    })
  }

  /**
   * Reset the runner
   */
  resetRunner(): void {
    // @ts-ignore
    this.httpService.reset()
  }

  /**
   * Run a test
   */
  run(reportId: string): void {
    const data: any = {}
    data['testStorage'] = [reportId]

    this.httpService.runReport(data, this.toastComponent).subscribe(() => {
      setTimeout(() => {
        this.queryResults()
      }, this.TIMEOUT)
    })
  }

  /**
   * Runs all tests
   */
  runAll(): void {
    const selectedReports = this.reports.filter(report => report.checked);
    let data: any = {}
    data['testStorage'] = []
    for (let i = 0; i < selectedReports.length; i++) {
      data['testStorage'].push(selectedReports[i][this.STORAGE_ID_INDEX])
    }

    this.httpService.runReport(data, this.toastComponent).subscribe(() => {
      setTimeout(() => {
        this.queryResults();
      }, this.TIMEOUT)
    })
  }

  /**
   * Query the results of the test run
   */
  queryResults(): void {
    this.httpService.queryResults(this.toastComponent).subscribe(response => {
      this.toastComponent.addAlert({type: 'success', message: 'Test run(s) completed!'})

      // Retrieve each report in the result runner
      for (let reportIndex in response.results) {
        if (response.results.hasOwnProperty(reportIndex)) {
          this.httpService.getReport(reportIndex, this.toastComponent).subscribe(report => {

            // See if the report element exist, where we will attach the results to
            const element = document.getElementById('testReport#' + reportIndex)
            if (element) {
              if (element.childElementCount > 5 && element.lastChild != null) {
                element.removeChild(element.lastChild)
              }
              element.appendChild(this.createResultElement(response.results, reportIndex, report))
            }
          })
        }
      }
    })
  }

  createResultElement(results: any, reportIndex: string, originalReport: any): Element {
    const tdElement = document.createElement('td')
    const resultReport = results[reportIndex];
    tdElement.appendChild(document.createTextNode("("
      + resultReport['previous-time'] + "ms >> "
      + resultReport['current-time'] + "ms) ("
      + resultReport['stubbed'] + "/"
      + resultReport['total'] + " stubbed)"
    ))

    // If the reports are not equal, then a reportIndex color should be shown
    const color = originalReport == results[reportIndex].report ? 'green' : 'red'
    tdElement.setAttribute('style', 'color:' + color)

    // Make sure only 1 result is shown and they don't append
    const rerunIndex = this.reranReports.findIndex(x => x.original == reportIndex);
    if (rerunIndex !== -1) {
      this.reranReports.splice(rerunIndex, 1);
      this.reranReportsIndex.splice(rerunIndex, 1)
    }

    // Keep track of the reports that have been ran
    this.reranReports.push({original: reportIndex, reran: results[reportIndex].report.storageId});
    this.reranReportsIndex.push(reportIndex)
    return tdElement;
  }

  /**
   * Selects the report to be displayed
   * @param storageId - the storageId of the report
   * @param name - the name of the report
   */
  selectReport(storageId: number, name: string): void {
    this.httpService.getReport(storageId.toString(), this.toastComponent).subscribe(data => {
      this.openTestReportEvent.emit({data: data, name: name})
    })
  }

  /**
   * Removes the selected reports
   */
  deleteSelected(): void {
    const selectedReports = this.reports.filter(report => report.checked);
    for (let i = 0; i < selectedReports.length; i++) {
      this.httpService.deleteReport(selectedReports[i][this.STORAGE_ID_INDEX], this.toastComponent).subscribe(() => {
        this.loadData();
      })
    }
  }

  /**
   * Download selected reports
   * @param exportMessages - boolean whether to download messages
   * @param exportReports = boolean whether to download reports
   */
  downloadSelected(exportMessages: boolean, exportReports: boolean): void {
    const selectedReports = this.reports.filter(report => report.checked);
    let queryString = "?";
    for (let i = 0; i < selectedReports.length; i++) {
        queryString += "id=" + selectedReports[i][this.STORAGE_ID_INDEX] + "&"
    }
    window.open('api/report/download/testStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));

  }

  /**
   * Upload a report
   * @param event - the target file to upload
   */
  uploadReport(event: any): void {
    const file: File = event.target.files[0]
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      this.httpService.uploadReport(formData, this.toastComponent).subscribe(() => {
        this.toastComponent.addAlert({type: 'success', message: 'Report uploaded!'})
        this.loadData()
      })
    }
  }

  /**
   * Compare two reports with each other in compare tab
   * @param originalReport - the original report that will be compared to the new one
   */
  compareReports(originalReport: string): void {
    let index = this.reranReportsIndex.indexOf(originalReport);
    let newReport = this.reranReports[index].reran;
    this.openCompareReportsEvent.emit({oldReport: originalReport, newReport: newReport})
  }

  /**
   * Replace the original report
   * @param reportId - report that will be replaced
   */
  replaceReport(reportId: string): void {
    this.httpService.replaceReport(reportId, this.toastComponent).subscribe(() => {
      let index = this.reranReportsIndex.indexOf(reportId);
      this.reranReportsIndex.splice(index, 1);
      this.reranReports.splice(index, 1);
    })
  }

  /**
   * Toggle the checkbox
   * @param report - the report that is toggled
   */
  toggleCheck(report: any): void {
    let index = this.reports.indexOf(report);
    this.reports[index].checked = !report.checked
  }

  /**
   * Checks all checkboxes
   */
  checkAll(): void {
    for (let report of this.reports) {
      report.checked = true;
    }
  }

  /**
   * Unchecks all checkboxes
   */
  uncheckAll(): void {
    for (let report of this.reports) {
      report.checked = false;
    }
  }
}
