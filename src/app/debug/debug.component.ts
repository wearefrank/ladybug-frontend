import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Report } from '../shared/interfaces/report';
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
export class DebugComponent implements OnInit {
  static readonly ROUTER_PATH: string = 'debug';
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @ViewChild('reportComponent') customReportComponent!: ReportComponent;
  currentView!: View;
  views?: View[];

  constructor(
    private httpService: HttpService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.retrieveViews();
    this.retrieveErrorsAndWarnings();
  }

  retrieveViews(): void {
    this.httpService.getViews().subscribe({
      next: (views: View[]) => {
        this.views = views;
        if (!this.currentView) {
          this.currentView = this.views.find((v: View) => v.defaultView)!;
        }
      },
    });
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
