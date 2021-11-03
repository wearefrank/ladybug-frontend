import {Component, OnInit, EventEmitter, Output, Input, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {ToastComponent} from "../shared/components/toast/toast.component";
import {map, catchError, timeInterval} from "rxjs/operators";
import {throwError} from "rxjs";

const headers = new HttpHeaders().set(
  'Content-Type', 'application/json'
)
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit{
  reports: any[] = [];
  metadata: any = {};
  @Output() openTestReportEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  constructor(private modalService: NgbModal, private http: HttpClient) {}

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
    this.http.get<any>('api/metadata/testStorage').subscribe(data => {
      this.reports = data.values
      this.checkAll();
    }, () => {
      this.toastComponent.addAlert({type: 'danger', message: 'Could not retrieve data for testing!'})
    });
  }

  resetRunner() {
    // @ts-ignore
    this.http.post<any>('api/runner/reset')
  }

  /**
   * Run a test
   */
  run(reportId: string) {
    // Rerun a report -> POST ladybug/runner/run/debugStorage, Map<String, List<Int>>
    // Query the results of the new report -> GET ladybug/runner/result/debugStorage
    // Show a progress bar
    // Show the difference in ms and how many have been stubbed
    // Either replace -> PUT Call ladybug/runner/replace/debugStorage/reportId
    // Or Compare
    // Go to compare tab and show the two reports
    console.log("Rerunning report...")
    let data: any = {}
    data['testStorage'] = [reportId]
    this.http.post<any>('api/runner/run/debugStorage', data, {headers: headers, observe: "response"}).subscribe(
      response => {
        console.log(response)
        setTimeout(() => {
          this.queryResults()
        }, 1000)
      },
        error => {
        console.log(error)
        this.toastComponent.addAlert({ type: 'danger', message: error})
      })
  }

  queryResults() {
    console.log("Querying results...")
    this.http.get<any>('api/runner/result/debugStorage', {headers: headers}).subscribe(
      response => {
        console.log(response)
      },
        error => {
        console.log(error)
        this.toastComponent.addAlert({type: 'danger', message: "(" + error.status + ") " + error.statusText})
      })
  }

  /**
   * Runs all tests
   */
  async runAll() {
    let selectedReports = this.reports.filter(report => report.checked);
    for (let report in selectedReports) {
      await this.run(report[5]) // 5 is the index of the reportId
    }
  }

  /**
   * Selects the report to be displayed
   * @param storageId - the storageId of the report
   * @param name - the name of the report
   */
  selectReport(storageId: number, name: string) {
    this.http.get<any>('api/report/debugStorage/' + storageId).subscribe(data => {
      this.openTestReportEvent.emit({data: data, name: name})
    }, () => {
      this.toastComponent.addAlert({type: 'warning', message: 'Could not retrieve data for report!'})
    })
  }

  /**
   * Removes the selected reports
   */
  deleteSelected() {
    let selectedReports = this.reports.filter(report => report.checked);
    for (let i = 0; i < selectedReports.length; i++) {
        this.http.delete('api/report/testStorage/' + selectedReports[i][5]).subscribe(() => {
        this.loadData()
      }, error => {
          console.log(error)
          this.toastComponent.addAlert({type: 'danger', message: 'Could not delete report!'})
        })
    }
  }

  downloadSelected(exportMessages: boolean, exportReports: boolean) {

    let selectedReports = this.reports.filter(report => report.checked);
    let queryString = "?";
    for (let i = 0; i < selectedReports.length; i++) {
        queryString += "id=" + selectedReports[i][5] + "&"
    }
    console.log("Query string: " + queryString);
    window.open('api/report/download/testStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));

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
