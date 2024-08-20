import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TestListItem } from '../../shared/interfaces/test-list-item';
import { catchError, Subscription } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { TabService } from '../../shared/services/tab.service';
import { HelperService } from '../../shared/services/helper.service';
import { Report } from '../../shared/interfaces/report';
import { ReportData } from '../../shared/interfaces/report-data';
import { View } from '../../shared/interfaces/view';
import { TestReportsService } from '../test-reports.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-table',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './test-table.component.html',
  styleUrl: './test-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTableComponent implements OnChanges, OnInit, OnDestroy {
  @Input({ required: true }) reports!: TestListItem[];
  @Input() currentFilter: string = '';
  @Input() showStorageIds?: boolean;
  @Output() runEvent: EventEmitter<TestListItem> = new EventEmitter<TestListItem>();
  protected amountOfSelectedReports: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
    private tabService: TabService,
    private helperService: HelperService,
    private testReportsService: TestReportsService,
    private toastService: ToastService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentFilter'] || changes['reports']) {
      this.amountOfSelectedReports = 0;
      for (const report of this.reports) {
        if (report.checked) {
          this.amountOfSelectedReports++;
        }
        if (report.variables) {
          report.extractedVariables = this.extractVariables(report.variables);
        }
      }
      this.testReportsService.setAmountSelected(this.amountOfSelectedReports);
      this.getFullPaths();
    }
  }

  ngOnInit(): void {
    this.subscribeToSubscriptions();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromSubscriptions();
  }

  subscribeToSubscriptions(): void {
    const amountSelectedSubscription: Subscription = this.testReportsService.amountSelected$.subscribe({
      next: (value: number): void => {
        this.amountOfSelectedReports = value;
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(amountSelectedSubscription);
  }

  unsubscribeFromSubscriptions(): void {
    this.subscriptions.unsubscribe();
  }

  openReport(storageId: number): void {
    this.httpService.getReport(storageId, this.testReportsService.storageName).subscribe({
      next: (report: Report): void => {
        const reportData: ReportData = {
          report: report,
          currentView: {
            storageName: this.testReportsService.storageName,
            metadataNames: this.testReportsService.metadataNames,
          } as View,
        };
        this.tabService.openNewTab(reportData);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  getFullPaths(): void {
    for (const report of this.reports) {
      report.fullPath = report.path
        ? `${report.path.replace(this.currentFilter, '')}${report.name}`
        : `/${report.name}`;
    }
  }

  extractVariables(variables: string): string {
    if (!variables || variables == 'null') {
      return '';
    }
    const map: string[] = variables.split('\n');
    const keys: string[] = map[0].split(',');
    const values: string[] = map[1].split(',');
    let resultString: string = '';
    for (let i in keys) {
      resultString += keys[i] + '=' + values[i] + ', ';
    }
    return resultString.slice(0, -2);
  }

  replaceReport(reportId: number): void {
    this.toastService.showWarning('Sorry this is not implemented as of now');
    // this.httpService.replaceReport(reportId, this.storageName).subscribe({
    //   next: () => {
    //     this.reranReports = this.reranReports.filter((report: ReranReport) => report.id != reportId);
    //   },
    //   error: () => catchError(this.errorHandler.handleError()),
    // });
  }

  compareReports(report: TestListItem): void {
    if (report.reranReport) {
      const tabId: string = this.helperService.createCompareTabId(
        report.reranReport.originalReport,
        report.reranReport.runResultReport,
      );
      this.tabService.openNewCompareTab({
        id: tabId,
        viewName: 'compare',
        originalReport: report.reranReport.originalReport,
        runResultReport: report.reranReport.runResultReport,
      });
    }
  }

  toggleSelectAll(): void {
    if (this.amountOfSelectedReports === this.reports.length) {
      this.testReportsService.setAmountSelected(0);
    } else {
      this.testReportsService.setAmountSelected(this.reports.length);
    }
  }

  toggleCheck(report: TestListItem): void {
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
    }
    this.testReportsService.setAmountSelected(this.amountOfSelectedReports);
  }
}
