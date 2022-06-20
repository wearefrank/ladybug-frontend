import { Component, OnInit, Output, EventEmitter, Input, ViewChild, OnDestroy } from '@angular/core';
import { ToastComponent } from '../toast/toast.component';
import { HelperService } from '../../services/helper.service';
import { HttpService } from '../../services/http.service';
import { LoaderService } from '../../services/loader.service';
import { TableSettingsModalComponent } from '../modals/table-settings-modal/table-settings-modal.component';
import { TableSettings } from '../../interfaces/table-settings';
import { catchError } from 'rxjs';
import { Report } from '../../interfaces/report';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnDestroy {
  DEFAULT_DISPLAY_AMOUNT: number = 10;
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
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    const tableSettings = this.loaderService.getTableSettings(this._id);
    const viewSettings = this.loaderService.getViewSettings();
    if (!tableSettings.tableLoaded) {
      this.loadData();
    } else {
      this.tableSettings = tableSettings;
      this.viewSettings = viewSettings;
      this.changeViewEvent.emit(this.viewSettings.currentView);
    }
  }

  ngOnDestroy(): void {
    this.loaderService.saveTableSettings(this._id, this.tableSettings);
    this.loaderService.saveViewSettings(this.viewSettings);
  }

  retrieveRecords() {
    let regexFilter = '.*';
    if (this.tableSettingsModal) {
      regexFilter = this.tableSettingsModal.getRegexFilter();
    }

    this.httpService
      .getReports(
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

  showCompareButton(): boolean {
    return this.tableSettings.reportMetadata.filter((report) => report.checked).length == 2;
  }

  compareTwoReports() {
    let compareReports: Report[] = [];

    this.tableSettings.reportMetadata
      .filter((report) => report.checked)
      .forEach((checkedReport) => {
        this.httpService
          .getReport(checkedReport.storageId, this.viewSettings.currentView.storageName)
          .subscribe((data) => {
            let report: Report = data.report;
            report.xml = data.xml;
            compareReports.push(report);
          });
      });

    setTimeout(() => {
      this.openCompareReportsEvent.emit({
        originalReport: compareReports[0],
        runResultReport: compareReports[1],
      });
    }, 100);
  }

  changeFilter(event: any, header: string): void {
    this.tableSettings.filterHeader = header;
    this.tableSettings.filterValue = event.target.value;
  }

  changeTableLimit(event: any): void {
    this.tableSettings.displayAmount = event.target.value === '' ? 0 : event.target.value;
    this.loadData();
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
    window.open(
      'api/report/download/' +
        this.viewSettings.currentView.storageName +
        '/' +
        exportBinary +
        '/' +
        exportXML +
        queryString.slice(0, -1)
    );
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
