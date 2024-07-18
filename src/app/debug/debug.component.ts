import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
import { Subscription, catchError } from 'rxjs';
import { DebugReportService } from './debug-report.service';
import { AngularSplitModule } from 'angular-split';
import { TableComponent } from './table/table.component';
import { ReportComponent } from '../report/report.component';
import { ToastService } from '../shared/services/toast.service';
import { HttpService } from '../shared/services/http.service';
import { View } from '../shared/interfaces/view';
import { ErrorHandling } from '../shared/classes/error-handling.service';

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
  @ViewChild('reportComponent') customReportComponent!: ReportComponent;
  currentView?: View;
  views?: View[];

  private viewSubscription!: Subscription;

  constructor(
    private debugReportService: DebugReportService,
    private httpService: HttpService,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
  ) {}

  ngOnInit(): void {
    this.retrieveViews();
    this.subscribeToServices();
    this.retrieveErrorsAndWarnings();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  retrieveViews(): void {
    this.httpService.getViews().subscribe({
      next: (views: View[]) => {
        this.views = views;
        if (!this.currentView) {
          this.currentView = this.views.find((v: View) => v.defaultView);
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  subscribeToServices(): void {
    this.viewSubscription = this.debugReportService.changeViewObservable.subscribe({
      next: (view) => (this.currentView = view),
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  unsubscribeAll(): void {
    if (this.viewSubscription) {
      this.viewSubscription.unsubscribe();
    }
  }

  addReportToTree(report: Report): void {
    this.customReportComponent.addReportToTree(report);
  }

  onViewChange(view: View): void {
    this.currentView = view;
    this.retrieveErrorsAndWarnings();
  }

  retrieveErrorsAndWarnings(): void {
    if (this.currentView) {
      this.httpService.getWarningsAndErrors(this.currentView.storageName).subscribe({
        next: (value: string | undefined): void => {
          if (value) {
            this.showErrorsAndWarnings(value);
          }
        },
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  showErrorsAndWarnings(value: string): void {
    if (value.length > this.toastService.TOASTER_LINE_LENGTH) {
      const errorSnippet: string = value.slice(0, Math.max(0, this.toastService.TOASTER_LINE_LENGTH)).trim();
      this.toastService.showDanger(`${errorSnippet}...`, value);
    } else {
      this.toastService.showDanger(value, value);
    }
  }
}
