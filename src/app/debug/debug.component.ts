import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { DisplayComponent } from './display/display.component';
import { Report } from '../shared/interfaces/report';
import { DebugTreeComponent } from './debug-tree/debug-tree.component';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
})
export class DebugComponent {
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  currentView: any = {};

  constructor() {}

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
}
