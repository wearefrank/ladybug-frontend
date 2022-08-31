import { AfterViewInit, Component, Injectable, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { HelperService } from '../shared/services/helper.service';
import { EditDisplayComponent } from './edit-display/edit-display.component';
import { DynamicService } from '../shared/services/dynamic.service';
import { DisplayComponent } from '../debug/display/display.component';

@Injectable()
export class ReportData {
  data: {} = {};
  defaultDisplay: any;
  currentView: any;
}

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements AfterViewInit {
  @ViewChild('treeReference') treeReference!: jqxTreeComponent;
  @ViewChild(EditDisplayComponent) editDisplayComponent!: EditDisplayComponent;
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  defaultDisplay: boolean = false;
  currentView: any = {};

  constructor(
    public reportData: ReportData,
    private helperService: HelperService,
    private dynamicService: DynamicService
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createTree(<Report>(<unknown>this.reportData));
      this.treeReference.selectItem(this.treeReference.getItems()[0]);
      this.currentView = this.reportData.currentView;
      if (this.reportData.defaultDisplay) {
        this.displayComponent?.showReport(this.reportData);
      } else {
        this.editDisplayComponent?.showReport(this.reportData);
      }
    });
  }

  createTree(report: Report) {
    let tree = this.helperService.convertReportToJqxTree(report);
    this.treeReference.createComponent({ height: '100%', width: '100%', source: [tree] });
  }

  selectReport(currentReport: any): void {
    let report = currentReport.owner.selectedItem.value;
    if (this.reportData.defaultDisplay) {
      this.displayComponent.showReport(report);
    } else {
      this.editDisplayComponent.showReport(report);
    }
  }

  savingReport(report: any) {
    let selectedNodeIndex = this.treeReference.getItems().findIndex((item) => item.selected);
    this.treeReference.clear();
    let tree = this.helperService.convertReportToJqxTree(report);
    this.treeReference.addTo(tree, null);
    this.treeReference.selectItem(this.treeReference.getItems()[selectedNodeIndex]);
    this.dynamicService.outputFromDynamicComponent(report);
  }
}
