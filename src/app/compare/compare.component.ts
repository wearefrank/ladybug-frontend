import {Component, Input, OnChanges, ViewChild} from '@angular/core';
import {TreeComponent} from "../shared/components/tree/tree.component";
import {DisplayComponent} from "../shared/components/display/display.component";
import {HttpService} from "../shared/services/http.service";
import {ToastComponent} from "../shared/components/toast/toast.component";

@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.css']
})
export class CompareComponent implements OnChanges {
  leftReport: any = {reports: [], id: "leftId", current: {}, selected: false}
  rightReport: any = {reports: [], id: "rightId", current: {}, selected: false}
  @ViewChild('leftTree') leftTreeComponent!: TreeComponent;
  @ViewChild('rightTree') rightTreeComponent!: TreeComponent;
  @ViewChild('leftDisplay') leftDisplayComponent!: DisplayComponent;
  @ViewChild('rightDisplay') rightDisplayComponent!: DisplayComponent;
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;

  @Input('diffReports') diffReports = {oldReport: '', newReport: ''}

  constructor(private httpService: HttpService) {}

  ngOnChanges() {
    if (this.diffReports.oldReport != '') {
      this.selectReportBasedOnIds()
    }
  }

  /**
   * Select report based on the specified ids in diffReports
   */
  selectReportBasedOnIds(): void {
    this.httpService.getReport(this.diffReports.oldReport, this.toastComponent).subscribe(result => {
      result.id = "leftId"
      this.addReportNodeLeft(result)
    })

    this.httpService.getReport(this.diffReports.newReport, this.toastComponent).subscribe(result => {
      result.id = "rightId"
      this.addReportNodeRight(result)
    })
  }

  /**
   * Adds a report to the left tree
   * @param newReport - report to be added
   */
  addReportNodeLeft(newReport: any): void {
    if (this.leftReport.id === newReport.id) {
      this.leftReport.reports.push(newReport);
      this.leftTreeComponent?.handleChange(this.leftReport.reports);
    }
  }

  /**
   * Adds a report to the right tree
   * @param newReport - report to be added
   */
  addReportNodeRight(newReport: any): void {
    if (this.rightReport.id === newReport.id) {
      this.rightReport.reports.push(newReport);
      this.rightTreeComponent?.handleChange(this.rightReport.reports);
    }
  }

  /**
   * Show the report of the left tree on the left display
   * @param currentReport - the report to be displayed
   */
  selectReportLeft(currentReport: any): void {
    this.leftReport.selected = true;
    this.leftReport.current = currentReport;
    this.leftDisplayComponent?.showReport(this.leftReport.current);
  }

  /**
   * Show the report of the right tree on the right display
   * @param currentReport - the report to be displayed
   */
  selectReportRight(currentReport: any): void {
    this.rightReport.selected = true;
    this.rightReport.current = currentReport;
    this.rightDisplayComponent?.showReport(this.rightReport.current);
  }

  /**
   * Close the left report
   * @param currentNode - the left node to be removed
   */
  closeReportLeft(currentNode: any): void {
    this.leftReport.selected = false
    this.leftReport.current = {};
    this.leftTreeComponent?.removeNode(currentNode);
  }

  /**
   * Close the right report
   * @param currentNode - the right node to be removed
   */
  closeReportRight(currentNode: any): void {
    this.rightReport.selected = false;
    this.rightReport.current = {};
    this.rightTreeComponent?.removeNode(currentNode);
  }
}
