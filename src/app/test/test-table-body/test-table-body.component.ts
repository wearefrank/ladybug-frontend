import { Component, Input, OnInit, Output } from '@angular/core';
import { catchError, Subject } from 'rxjs';
import { ErrorHandling } from '../../shared/classes/error-handling.service';
import { TestListItem } from '../../shared/interfaces/test-list-item';
import { Report } from '../../shared/interfaces/report';
import { ReportData } from '../../shared/interfaces/report-data';
import { View } from '../../shared/interfaces/view';
import { HttpService } from '../../shared/services/http.service';
import { TabService } from '../../shared/services/tab.service';
import { ToastService } from '../../shared/services/toast.service';
import { HelperService } from '../../shared/services/helper.service';

@Component({
  selector: 'app-test-table-body',
  standalone: true,
  imports: [],
  templateUrl: './test-table-body.component.html',
  styleUrl: './test-table-body.component.css',
})
export class TestTableBodyComponent implements OnInit {
  @Input({ required: true }) report!: TestListItem;
  @Input({ required: true }) storageName!: string;
  @Input({ required: true }) metadataNames!: string[];
  @Input({ required: true }) currentFilter!: string;
  @Input() showStorageIds?: boolean;
  @Output() runSubject: Subject<TestListItem> = new Subject();
  private amountOfSelectedReports: number = 0;

  constructor(
    private errorHandler: ErrorHandling,
    private httpService: HttpService,
    private tabService: TabService,
    private toastService: ToastService,
    private helperService: HelperService,
  ) {}

  ngOnInit() {
    console.log(this.report);
    if (!this.showStorageIds) {
      this.showStorageIds = false;
    }
  }

  extractVariables(variables: string): string {
    if (!variables || variables == 'null') {
      return '';
    }
    const map = variables.split('\n');
    const keys = map[0].split(',');
    const values = map[1].split(',');
    let resultString = '';
    for (let i in keys) {
      resultString += keys[i] + '=' + values[i] + ', ';
    }
    return resultString.slice(0, -2);
  }

  getFullPath(path: string, name: string): string {
    if (path) {
      return `${path.replace(this.currentFilter, '')}${name}`;
    }
    return `/${name}`;
  }

  toggleCheck(report: TestListItem): void {
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
    }
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

  replaceReport(report: TestListItem): void {
    this.toastService.showWarning('Sorry this is not implemented as of now');
    // this.httpService.replaceReport(report.storageId, this.storageName).subscribe({
    //   next: (value) => {
    //     this.httpService.getReport(report.storageId, this.storageName).subscribe({
    //       next: (response: Report): void => {
    //         report = { ...response };
    //       },
    //     });
    //   },
    //   error: () => catchError(this.errorHandler.handleError()),
    // });
  }

  compareReports(report: TestListItem): void {
    if (report.reranReport) {
      // TODO: move createCompareTabId to separate static utility class
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
}
