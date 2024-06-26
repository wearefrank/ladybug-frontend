import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
import { Subscription } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { AngularSplitModule } from 'angular-split';
import { TableComponent } from './table/table.component';
import { ReportComponent } from '../report/report.component';
import { ToastService } from '../shared/services/toast.service';
import { HttpService } from '../shared/services/http.service';

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

  constructor(
    private debugReportService: DebugReportService,
    private httpService: HttpService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.subscribeToServices();
    this.retrieveErrorsAndWarnings();
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
    this.retrieveErrorsAndWarnings();
  }

  retrieveErrorsAndWarnings(): void {
    if (this.currentView.currentViewName) {
      this.httpService
        .getWarningsAndErrors(this.currentView.storageName)
        .subscribe((value: string | undefined): void => {
          if (value) {
            this.showErrorsAndWarnings(value);
          }
        });
    }
  }

  showErrorsAndWarnings(value: string): void {
    if (value.length > this.toastService.TOASTER_LINE_LENGTH) {
      const errorSnippet: string = value.slice(0, Math.max(0, this.toastService.TOASTER_LINE_LENGTH)).trim() + '...';
      this.toastService.showDanger(errorSnippet, value);
    } else {
      this.toastService.showDanger(value, value);
    }
  }
}
