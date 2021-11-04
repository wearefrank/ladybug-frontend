import {Component, OnInit, EventEmitter, Output, Input, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ToastComponent} from "../shared/components/toast/toast.component";
import {lastValueFrom} from "rxjs";

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
  reranReports: any[] = [];
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
    console.log("Rerunning report...")
    let data: any = {}
    data['testStorage'] = [reportId]
    this.http.post<any>('api/runner/run/debugStorage', data, {headers: headers, observe: "response"}).subscribe(
      () => {
        setTimeout(() => {
          this.queryResults()
        }, 100)
      },
        error => {
        console.log(error)
        this.toastComponent.addAlert({ type: 'danger', message: error})
      })
  }

  /**
   * Runs all tests
   */
  runAll() {
    console.log("Rerunning all reports...")
    let selectedReports = this.reports.filter(report => report.checked);
    let data: any = {}
    data['testStorage'] = []
    for (let i = 0; i < selectedReports.length; i++) {
      data['testStorage'].push(selectedReports[i][5])
    }

    this.http.post<any>('api/runner/run/debugStorage', data, {headers: headers, observe: "response"}).subscribe(
      () => {
        setTimeout(() => {
          this.queryResults()
        }, 100)
      },
      error => {
        console.log(error)
        this.toastComponent.addAlert({ type: 'danger', message: error})
      })
  }

  /**
   * Query the results of the test run
   */
  async queryResults() {
    let request = this.http.get('api/runner/result/debugStorage', {headers: headers});
    let response: any = await lastValueFrom(request);

    for (let result in response.results) {
      if (response.results.hasOwnProperty(result)) {
        let requestReport = this.http.get('api/report/debugStorage/' + result);
        let report: any = await lastValueFrom(requestReport);

        let element =  document.getElementById('testReport#' + result)
        if (element ) {
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
          let rerunIndex = this.reranReports.findIndex(x => x.original == result);
          if (rerunIndex !== -1) {
            this.reranReports.splice(rerunIndex, 1);
          }
          this.reranReports.push({original: result, reran: response.results[result].report.storageId});
        }
      }
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
    window.open('api/report/download/testStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));

  }

  uploadReport(event: any) {
    const file: File = event.target.files[0]
    if (file) {
      console.log("Uploading " + file.name);
      const formData = new FormData();
      formData.append("file", file);
      this.http.post('api/report/upload/testStorage', formData, {headers: {'Content-Type': 'multipart/form-data'}}).subscribe(() => {
        this.loadData();
      })
    }
  }

  compareReports(reportId: string) {
    // Get both storageIds
    // Open the compare tab
    // Select at the left side the previous one
    // Select at the right side the new one
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
