import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
import { Subscription } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { AngularSplitModule } from 'angular-split';
import { TableComponent } from './table/table.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
  standalone: true,
  imports: [TableComponent, AngularSplitModule, ReportComponent],
})
export class DebugComponent implements OnInit, OnDestroy {
  static readonly ROUTER_PATH: string = 'debug';
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @ViewChild('bottom') container!: ElementRef<HTMLElement>;
  @ViewChild('reportComponent') customReportComponent!: ReportComponent;
  currentView: any = {};
  loaded: boolean = false;

  private viewSubscription!: Subscription;

  constructor(private debugReportService: DebugReportService) {}

  ngOnInit(): void {
    this.subscribeToServices();
  }

  ngOnAfterViewInit() {
    this.loaded = true;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  subscribeToServices(): void {
    this.viewSubscription = this.debugReportService.changeViewObservable.subscribe((view) => (this.currentView = view));
  }

  unsubscribeAll(): void {
    if (this.viewSubscription) {
      this.viewSubscription.unsubscribe();
    }
  }

  addReportToTree(report: Report): void {
    this.customReportComponent.addReportToTree(report);
  }

  onViewChange(viewName: string): void {
    this.currentView.currentViewName = viewName;
  }
}
