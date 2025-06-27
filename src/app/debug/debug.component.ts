/* eslint-disable no-unused-vars */
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularSplitModule, SplitComponent } from 'angular-split';
import { CommonModule } from '@angular/common';
import { Report } from '../shared/interfaces/report';
import { TableComponent } from './table/table.component';
import { ReportComponent } from '../report/report.component';
import { ToastService } from '../shared/services/toast.service';
import { HttpService } from '../shared/services/http.service';
import { View } from '../shared/interfaces/view';
import { catchError } from 'rxjs';
import { ErrorHandling } from '../shared/classes/error-handling.service';

@Component({
  selector: 'app-debug',
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.css'],
  standalone: true,
  imports: [AngularSplitModule, CommonModule, TableComponent, ReportComponent],
})
export class DebugComponent implements OnInit {
  static readonly ROUTER_PATH: string = 'debug';
  @ViewChild('reportComponent') customReportComponent!: ReportComponent;
  @ViewChild(SplitComponent) splitter!: SplitComponent;
  currentView?: View;
  views?: View[];
  hasItems = false;
  bottomHeight = 300;

  private isResizing = false;
  private startY = 0;
  private startHeight = 0;

  constructor(
    private httpService: HttpService,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
  ) {}

  ngOnInit(): void {
    this.retrieveViews();
  }
  closeEntireTree(): void {
    this.hasItems = false;
  }

  startResizing(event: MouseEvent): void {
    this.isResizing = true;
    this.startY = event.clientY;
    this.startHeight = this.bottomHeight;

    document.addEventListener('mousemove', this.resizePane);
    document.addEventListener('mouseup', this.stopResizing);
  }

  resizePane = (event: MouseEvent): void => {
    if (!this.isResizing) return;

    const delta = this.startY - event.clientY;
    this.bottomHeight = Math.min(Math.max(this.startHeight + delta, 100), window.innerHeight - 100);
  };

  stopResizing = (): void => {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.resizePane);
    document.removeEventListener('mouseup', this.stopResizing);
  };

  protected addReportToTree(report: Report): void {
    this.hasItems = true;
    this.customReportComponent.addReportToTree(report);
  }

  protected onViewChange(view: View): void {
    this.currentView = view;
    this.retrieveErrorsAndWarnings();
  }

  private retrieveViews(): void {
    this.httpService
      .getViews()
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (views: View[]) => {
          this.views = views;
          if (!this.currentView) {
            this.onViewChange(this.views.find((v: View) => v.defaultView)!);
          }
        },
      });
  }

  private retrieveErrorsAndWarnings(): void {
    if (this.currentView) {
      this.httpService
        .getWarningsAndErrors(this.currentView.storageName)
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: (value: string | undefined): void => {
            if (value) {
              this.showErrorsAndWarnings(value);
            }
          },
        });
    }
  }

  private showErrorsAndWarnings(value: string): void {
    if (value.length > this.toastService.TOASTER_LINE_LENGTH) {
      const errorSnippet: string = value.slice(0, Math.max(0, this.toastService.TOASTER_LINE_LENGTH)).trim();
      this.toastService.showDanger(`${errorSnippet}...`, value);
    } else {
      this.toastService.showDanger(value, value);
    }
  }
}
