import { Component, Output, EventEmitter, Input, ViewChild, OnInit } from '@angular/core';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { HelperService } from '../../shared/services/helper.service';
import { HttpService } from '../../shared/services/http.service';
import { TableSettingsModalComponent } from '../../shared/components/modals/table-settings-modal/table-settings-modal.component';
import { TableSettings } from '../../shared/interfaces/table-settings';
import { catchError } from 'rxjs';
import { Report } from '../../shared/interfaces/report';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  DEFAULT_DISPLAY_AMOUNT: number = 10;
  metadataCount = 0;
  viewSettings: any = {
    defaultView: '',
    views: [],
    currentView: {},
  };

  tableSettings: TableSettings = {
    tableId: '', // this._id might not be defined yet
    reportMetadata: [],
    tableLoaded: false,
    displayAmount: this.DEFAULT_DISPLAY_AMOUNT,
    showFilter: false,
    filterValue: '',
    filterHeader: '',
    reportsInProgress: 0,
    estimatedMemoryUsage: '',
  };
  @Output() openReportEvent = new EventEmitter<any>();
  @Output() openCompareReportsEvent = new EventEmitter<any>();
  @Output() openSelectedCompareReportsEvent = new EventEmitter<any>();
  @Output() changeViewEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(TableSettingsModalComponent)
  tableSettingsModal!: TableSettingsModalComponent;
  @Input() // Needed to make a distinction between the two halves in compare component
  get id() {
    return this._id;
  }
  set id(id: string) {
    this._id = id;
  }
  private _id: string = 'debug';

  constructor(
    private httpService: HttpService,
    public helperService: HelperService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.cookieService.set('transformationEnabled', 'true');
    this.loadData();
  }

  retrieveRecords() {
    let regexFilter = '.*';
    if (this.tableSettingsModal) {
      regexFilter = this.tableSettingsModal.getRegexFilter();
    }

    this.httpService
      .getMetadataReports(
        this.tableSettings.displayAmount,
        regexFilter,
        this.viewSettings.currentView.metadataNames,
        this.viewSettings.currentView.storageName
      )
      .subscribe({
        next: (value) => {
          this.tableSettings.reportMetadata = value;
          this.tableSettings.tableLoaded = true;
          this.toastComponent.addAlert({
            type: 'success',
            message: 'Data loaded!',
          });
        },
        error: () => {
          catchError(this.httpService.handleError());
        },
      });

    this.loadMetadataCount();
  }

  getViewNames() {
    return Object.keys(this.viewSettings.views);
  }

  changeView(event: any) {
    this.viewSettings.currentView = this.viewSettings.views[event.target.value];
    this.retrieveRecords();
    this.changeViewEvent.emit(this.viewSettings.currentView);
  }

  loadData(): void {
    this.httpService.getViews().subscribe((views) => {
      this.viewSettings.views = views;
      this.viewSettings.defaultView = Object.keys(this.viewSettings.views).find(
        (view) => this.viewSettings.views[view].defaultView
      );
      this.viewSettings.currentView = this.viewSettings.views[this.viewSettings.defaultView];
      this.changeViewEvent.emit(this.viewSettings.currentView);

      this.retrieveRecords();
    });

    this.loadReportInProgressSettings();
  }

  loadMetadataCount() {
    this.httpService.getMetadataCount(this.viewSettings.currentView.storageName).subscribe((count: any) => {
      this.metadataCount = count;
    });
  }

  loadReportInProgressSettings() {
    this.httpService.getSettings().subscribe({
      next: (settings) => {
        this.tableSettings.reportsInProgress = settings.reportsInProgress;
        this.tableSettings.estimatedMemoryUsage = settings.estMemory;
      },
    });
  }

  openModal(): void {
    this.tableSettingsModal.open();
  }

  getDate(seconds: string): Date {
    return new Date(Number.parseInt(seconds));
  }

  toggleFilter(): void {
    this.tableSettings.showFilter = !this.tableSettings.showFilter;
  }

  toggleCheck(report: any): void {
    report.checked = !report.checked;
  }

  getStatusColor(metadata: any): string {
    if (this.viewSettings.currentView.metadataNames.includes('status')) {
      return metadata.status == 'Success' ? '#c3e6cb' : '#f79c9c';
    }

    if (this.viewSettings.currentView.metadataNames.includes('STATE')) {
      return metadata.STATE == 'Success' ? '#c3e6cb' : '#f79c9c';
    }

    return 'none';
  }

  showCompareButton(): boolean {
    return this.tableSettings.reportMetadata.filter((report) => report.checked).length == 2;
  }

  compareTwoReports() {
    let compareReports: any = {};

    let selectedReports: string[] = this.tableSettings.reportMetadata
      .filter((report) => report.checked)
      .map((report) => report.storageId);
    this.httpService.getReports(selectedReports, this.viewSettings.currentView.storageName).subscribe({
      next: (data) => {
        let leftObject = data[selectedReports[0]];
        let originalReport = leftObject.report;
        originalReport.xml = leftObject.xml;

        let rightObject = data[selectedReports[1]];
        let runResultReport = rightObject.report;
        runResultReport.xml = rightObject.xml;

        compareReports = {
          originalReport: originalReport,
          runResultReport: runResultReport,
        };
      },

      complete: () => {
        this.openSelectedCompareReportsEvent.emit(compareReports);
      },
    });
  }

  changeFilter(event: any, header: string): void {
    this.tableSettings.filterHeader = header;
    this.tableSettings.filterValue = event.target.value;
  }

  changeTableLimit(event: any): void {
    this.tableSettings.displayAmount = event.target.value === '' ? 0 : event.target.value;
    this.retrieveRecords();
  }

  refresh(): void {
    this.tableSettings.showFilter = false;
    this.tableSettings.reportMetadata = [];
    this.tableSettings.tableLoaded = false;
    this.tableSettings.displayAmount = 10;
    this.loadData();
  }

  openReport(storageId: string): void {
    this.httpService.getReport(storageId, this.viewSettings.currentView.storageName).subscribe((data) => {
      let report: Report = data.report;
      report.xml = data.xml;
      report.id = this.id;
      this.openReportEvent.next(report);
    });
  }

  openAllReports(): void {
    this.tableSettings.reportMetadata.forEach((report: any) => this.openReport(report.storageId));
  }

  openLatestReports(amount: number): void {
    this.httpService.getLatestReports(amount, this.viewSettings.currentView.storageName).subscribe((data) => {
      data.forEach((report: any) => {
        report.id = this.id;
        this.openReportEvent.next(report);
      });
    });
  }

  openReportInProgress(index: number) {
    this.httpService.getReportInProgress(index).subscribe((report) => {
      report.id = this.id;
      this.openReportEvent.next(report);
    });
  }

  deleteReportInProgress(index: number) {
    this.httpService.deleteReportInProgress(index).subscribe({
      complete: () => {
        this.loadReportInProgressSettings();
      },
    });
  }

  disableReportInProgressButton(index: number, selector: string) {
    let element: HTMLButtonElement = document.querySelector(selector)!;
    element.disabled = index == 0 || index > this.tableSettings.reportsInProgress;
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    const queryString: string = this.tableSettings.reportMetadata.reduce(
      (totalQuery: string, selectedReport: any) => totalQuery + 'id=' + selectedReport.storageId + '&',
      '?'
    );
    this.helperService.download(queryString, this.viewSettings.currentView.storageName, exportBinary, exportXML);
  }

  uploadReports(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData: any = new FormData();
      formData.append('file', file);
      this.showUploadedReports(formData);
    }
  }

  showUploadedReports(formData: any) {
    this.httpService.uploadReport(formData).subscribe((data) => {
      for (let report of data) {
        report.id = this.id;
        this.openReportEvent.next(report);
      }
    });
  }
}
