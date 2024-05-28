import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { DisplayComponent } from '../debug/display/display.component';
import { DebugTreeComponent } from '../debug/debug-tree/debug-tree.component';
import { Subject, Subscription } from 'rxjs';
import { Report } from '../shared/interfaces/report';
import { DebugReportService } from '../debug/debug-report.service';
import { TabService } from '../shared/services/tab.service';
import { AngularSplitModule } from 'angular-split';

@Component({
  selector: 'app-report-display',
  templateUrl: './report-display.component.html',
  styleUrl: './report-display.component.css',
  standalone: true,
  imports: [AngularSplitModule, DebugTreeComponent, DisplayComponent],
})
export class ReportDisplayComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() containerHeight!: number;
  changeViewSubscription!: Subscription;
  addReportSubscription!: Subscription;
  openReportInTabSubscription!: Subscription;
  openReportsInCompareSubscription!: Subscription;
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @Output() openReportInSeparateTabEvent = new EventEmitter<any>();
  @ViewChild(DisplayComponent) displayComponent!: DisplayComponent;
  @ViewChild(DebugTreeComponent) debugTreeComponent!: DebugTreeComponent;
  @ViewChild('splitter') splitter: any;
  currentView: any = {};

  treeWidth: Subject<void> = new Subject<void>();

  constructor(
    private debugReportService: DebugReportService,
    private tabService: TabService,
  ) {}

  ngOnInit() {
    this.subscribeToDebugReportServiceObservables();
  }

  ngAfterViewInit() {
    if (this.splitter.dragProgress$) {
      this.splitter.dragProgress$.subscribe(() => {
        this.treeWidth.next();
      });
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  subscribeToDebugReportServiceObservables() {
    this.changeViewSubscription = this.debugReportService.changeViewObservable.subscribe(
      (value) => (this.currentView = value),
    );
    this.addReportSubscription = this.debugReportService.openReportObservable.subscribe((value) =>
      this.addReportToTree(value),
    );
    this.openReportsInCompareSubscription = this.tabService.openInCompareObservable.subscribe((value) =>
      this.openSelectedReports(value),
    );
    this.openReportInTabSubscription = this.tabService.openReportInTabObservable.subscribe((value) =>
      this.openReportInSeparateTab(value),
    );
  }

  unsubscribeAll() {
    if (this.changeViewSubscription) {
      this.changeViewSubscription.unsubscribe();
    }
    if (this.addReportSubscription) {
      this.addReportSubscription.unsubscribe();
    }
    if (this.openReportInTabSubscription) {
      this.openReportInTabSubscription.unsubscribe();
    }
    if (this.openReportsInCompareSubscription) {
      this.openReportsInCompareSubscription.unsubscribe();
    }
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

  openReportInSeparateTab(data: any) {
    data.data.currentView = this.currentView;
    this.openReportInSeparateTabEvent.emit(data);
  }

  openSelectedReports(data: any) {
    this.openSelectedCompareReportsEvent.emit(data);
  }
}
