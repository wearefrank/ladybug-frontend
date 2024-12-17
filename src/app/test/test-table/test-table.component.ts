import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TestListItem } from '../../shared/interfaces/test-list-item';
import { catchError } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { TabService } from '../../shared/services/tab.service';
import { Report } from '../../shared/interfaces/report';
import { ReportData } from '../../shared/interfaces/report-data';
import { View } from '../../shared/interfaces/view';
import { TestReportsService } from '../test-reports.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';

@Component({
  selector: 'app-test-table',
  standalone: true,
  imports: [
    FormsModule,
    MatTable,
    MatColumnDef,
    MatCell,
    MatCellDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
  ],
  templateUrl: './test-table.component.html',
  styleUrl: './test-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTableComponent implements OnChanges {
  @Input({ required: true }) reports!: TestListItem[];
  @Input() currentFilter: string = '';
  @Input() showStorageIds?: boolean;
  @Output() runEvent: EventEmitter<TestListItem> = new EventEmitter<TestListItem>();
  amountOfSelectedReports: number = 0;
  protected displayedColumns: string[] = [];

  constructor(
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
    private tabService: TabService,
    private testReportsService: TestReportsService,
    private toastService: ToastService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showStorageIds']) {
      this.updateDisplayColumn();
    }
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
      this.getFullPaths();
    }
  }

  updateDisplayColumn(): void {
    this.displayedColumns = ['select'];
    if (this.showStorageIds) {
      this.displayedColumns.push('storageId');
    }
    this.displayedColumns.push('run', 'name', 'description', 'variables', 'runResults', 'options');
  }

  openReport(storageId: number): void {
    this.httpService
      .getReport(storageId, this.testReportsService.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
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
      });
  }

  getFullPaths(): void {
    for (const report of this.reports) {
      if (report.path) {
        let transformedPath = report.path.replace(this.currentFilter, '');
        if (transformedPath.startsWith('/')) {
          transformedPath = transformedPath.slice(1);
        }
        report.fullPath = `${transformedPath}${report.name}`;
      } else {
        report.fullPath = `/${report.name}`;
      }
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

  replaceReport(report: TestListItem): void {
    this.toastService.showWarning('Sorry this is not implemented as of now');
  }

  compareReports(report: TestListItem): void {
    if (report.reranReport) {
      const tabId: string = this.tabService.createCompareTabId(
        report.reranReport.originalReport,
        report.reranReport.runResultReport,
      );
      this.tabService.openNewCompareTab({
        id: tabId,
        originalReport: {
          ...report.reranReport.originalReport,
          storageName: this.testReportsService.storageName,
        },
        // Temporary fix until https://github.com/wearefrank/ladybug/issues/283 is fixed
        runResultReport: {
          ...report.reranReport.runResultReport,
          storageName: 'Debug',
        },
      });
    }
  }

  toggleCheck(report: TestListItem): void {
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
    }
  }

  toggleSelectAll(): void {
    this.amountOfSelectedReports = this.amountOfSelectedReports === this.reports.length ? 0 : this.reports.length;
    if (this.amountOfSelectedReports > 0) {
      this.setCheckedForAllReports(true);
    } else {
      this.setCheckedForAllReports(false);
    }
  }

  setCheckedForAllReports(value: boolean): void {
    for (const report of this.reports) {
      report.checked = value;
    }
  }
}
