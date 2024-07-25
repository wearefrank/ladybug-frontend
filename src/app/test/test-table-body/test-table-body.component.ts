import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TestListItem } from '../../shared/interfaces/test-list-item';
import { ReranReport } from '../../shared/interfaces/reran-report';
import { catchError } from 'rxjs';
import { HttpService } from '../../shared/services/http.service';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { TabService } from '../../shared/services/tab.service';
import { HelperService } from '../../shared/services/helper.service';
import { Report } from '../../shared/interfaces/report';
import { ReportData } from '../../shared/interfaces/report-data';
import { View } from '../../shared/interfaces/view';

@Component({
  selector: 'app-test-table-body',
  standalone: true,
  imports: [],
  templateUrl: './test-table-body.component.html',
  styleUrl: './test-table-body.component.css',
})
export class TestTableBodyComponent implements OnChanges {
  @Input() reports?: TestListItem[];
  @Input() currentFilter: string = '';
  @Input() showStorageIds?: boolean;
  @Input() reranReports: ReranReport[] = [];
  @Input({ required: true }) storageName!: string;
  @Input({ required: true }) metadataNames!: string[];
  @Output() toggleCheckEvent: EventEmitter<TestListItem> = new EventEmitter<TestListItem>();
  @Output() runEvent: EventEmitter<TestListItem> = new EventEmitter<TestListItem>();
  showReport: boolean[] = [];

  constructor(
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
    private tabService: TabService,
    private helperService: HelperService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['currentFilter'] || changes['reports']) && this.reports) {
      this.showReport = [];
      for (const report of this.reports) {
        this.showReport.push(this.matches(report));
      }
    }
  }

  matches(report: TestListItem): boolean {
    const name: string = report.path + report.name;
    return new RegExp(`(/)?${this.currentFilter}.*`).test(name);
  }

  toggleCheck(report: TestListItem): void {
    this.toggleCheckEvent.emit(report);
  }

  run(report: TestListItem): void {
    this.runEvent.emit(report);
  }

  openReport(storageId: number, name: string): void {
    this.httpService.getReport(storageId, this.storageName).subscribe({
      next: (report: Report): void => {
        const reportData: ReportData = {
          report: report,
          currentView: { storageName: this.storageName, metadataNames: this.metadataNames } as View,
        };
        this.tabService.openNewTab(reportData);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  getFullPath(path: string, name: string): string {
    if (path) {
      return `${path.replace(this.currentFilter, '')}${name}`;
    }
    return `/${name}`;
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

  getReranReport(id: number): ReranReport | undefined {
    return this.reranReports.find((report: ReranReport) => report.id === id);
  }

  replaceReport(reportId: number): void {
    this.httpService.replaceReport(reportId, this.storageName).subscribe({
      next: () => {
        this.reranReports = this.reranReports.filter((report: ReranReport) => report.id != reportId);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  compareReports(id: number): void {
    const reranReport = this.reranReports.find((report: ReranReport) => report.id == id);
    if (reranReport) {
      const tabId: string = this.helperService.createCompareTabId(
        reranReport.originalReport,
        reranReport.runResultReport,
      );
      this.tabService.openNewCompareTab({
        id: tabId,
        viewName: 'compare',
        originalReport: reranReport.originalReport,
        runResultReport: reranReport.runResultReport,
      });
    }
  }
}
