import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { DisplayComponent } from './display/display.component';
import { Report } from '../shared/interfaces/report';
import { DebugTreeComponent } from './debug-tree/debug-tree.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
})
export class DebugComponent implements AfterViewInit {
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @Output() openReportInSeparateTabEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild('splitter') splitter: any;
  currentView: any = {};
  treeWidth: Subject<void> = new Subject<void>();

  constructor() {}

  ngAfterViewInit() {
    this.splitter.dragProgress$.subscribe(() => {
      this.treeWidth.next();
    });
  }

  addReportToTree(report: Report): void {
    this.debugTreeComponent.addReportToTree(report);
  }

  selectReport(currentReport: any): void {
    let report = currentReport.owner.selectedItem.value;
    this.displayComponent.showReport(report);
  }

  closeEntireTree(): void {
    this.displayComponent.closeReport(false);
  }

  closeReport(currentReport: any): void {
    this.debugTreeComponent.removeReport(currentReport);
  }

  openSelectedReports(data: any) {
    this.openSelectedCompareReportsEvent.emit(data);
  }

  changeView(view: any) {
    this.currentView = view;
  }

  openReportInSeparateTab(data: any) {
    data.data.currentView = this.currentView;
    this.openReportInSeparateTabEvent.emit(data);
  }
}
