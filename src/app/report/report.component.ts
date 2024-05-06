import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { HelperService } from '../shared/services/helper.service';
import { EditDisplayComponent } from './edit-display/edit-display.component';
import { DynamicService } from '../shared/services/dynamic.service';
import { DisplayComponent } from '../debug/display/display.component';
import { TabService } from '../shared/services/tab.service';
import { ActivatedRoute, Router } from '@angular/router';
import { View } from '../shared/interfaces/view';
import { ReportData } from '../shared/interfaces/report-data';
import { DebugComponent } from '../debug/debug.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit, AfterViewInit {
  static readonly ROUTER_PATH: string = 'report';
  @ViewChild('treeReference') treeReference!: jqxTreeComponent;
  @ViewChild(EditDisplayComponent) editDisplayComponent!: EditDisplayComponent;
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  currentView?: View;
  reportData?: ReportData;

  constructor(
    private tabService: TabService,
    private helperService: HelperService,
    private dynamicService: DynamicService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.reportData = this.tabService.activeReportTabs.get(this.getIdFromPath());
    if (!this.reportData) {
      this.router.navigate([DebugComponent.ROUTER_PATH]);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.reportData) {
        this.createTree(this.reportData.report);
        this.treeReference.selectItem(this.treeReference.getItems()[0]);
        this.currentView = this.reportData.currentView;
        this.editDisplayComponent.showReport(this.reportData.report);
      }
    });
  }

  getIdFromPath(): string {
    return this.route.snapshot.paramMap.get('id') as string;
  }

  createTree(report: Report): void {
    let tree = this.helperService.convertReportToJqxTree(report);
    this.treeReference.createComponent({ height: '100%', width: '100%', source: [tree], allowDrag: false });
  }

  selectReport(currentReport: any): void {
    let report = currentReport.owner.selectedItem.value;
    this.editDisplayComponent.showReport(report);
  }

  savingReport(report: any): void {
    let selectedNodeIndex = this.treeReference.getItems().findIndex((item) => item.selected);
    this.treeReference.clear();
    let tree = this.helperService.convertReportToJqxTree(report);
    this.treeReference.addTo(tree, null);
    this.treeReference.selectItem(this.treeReference.getItems()[selectedNodeIndex]);
    this.dynamicService.outputFromDynamicComponent(report);
  }
}
