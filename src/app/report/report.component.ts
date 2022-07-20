import { AfterViewInit, Component, Injectable, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { HelperService } from '../shared/services/helper.service';
import { EditDisplayComponent } from './edit-display/edit-display.component';

@Injectable()
export class ReportData {
  data: {} = {};
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements AfterViewInit {
  @ViewChild('treeReference') treeReference!: jqxTreeComponent;
  @ViewChild(EditDisplayComponent) editDisplayComponent!: EditDisplayComponent;

  constructor(public reportData: ReportData, private helperService: HelperService) {}

  /**
   Add a new report and notify the tree of the change
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createTree(<Report>(<unknown>this.reportData));
      this.treeReference.selectItem(this.treeReference.getItems()[0]);
      this.editDisplayComponent.showReport(this.reportData, true);
    });
  }

  createTree(report: Report) {
    let tree = this.helperService.convertReportToJqxTree(report);
    this.treeReference.createComponent({ height: '100%', width: '100%', source: [tree] });
  }

  /**
   * Select a report to be viewed in the display
   * @param currentReport - the report to be viewed
   */
  selectReport(currentReport: any): void {
    let report = currentReport.owner.selectedItem.value;
    this.editDisplayComponent.showReport(report, report.xml);
  }

  savingReport(something: any) {
    let selectedNode = this.treeReference.getSelectedItem();
    this.treeReference.destroy();
    this.createTree(something);
    this.treeReference.selectItem(selectedNode);
  }
}
