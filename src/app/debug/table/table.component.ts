import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { HelperService } from '../../shared/services/helper.service';
import { HttpService } from '../../shared/services/http.service';
import { TableSettingsModalComponent } from './table-settings-modal/table-settings-modal.component';
import { TableSettings } from '../../shared/interfaces/table-settings';
import { catchError, Subscription } from 'rxjs';
import { Report } from '../../shared/interfaces/report';
import { CookieService } from 'ngx-cookie-service';
import { ChangeNodeLinkStrategyService } from '../../shared/services/node-link-strategy.service';
import { SettingsService } from '../../shared/services/settings.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnDestroy {
  DEFAULT_DISPLAY_AMOUNT: number = 10;
  metadataCount = 0;
  viewSettings: any = {
    defaultView: '',
    views: [],
    currentView: {},
    currentViewName: '',
  };

  allRowsSelected: boolean = false;

  shortenedTableHeaders: Map<string, string> = new Map([
    ['Storage Id', 'Storage Id'],
    ['End time', 'End time'],
    ['Duration', 'Duration'],
    ['Name', 'Name'],
    ['Correlation Id', 'Correlation Id'],
    ['Status', 'Status'],
    ['Number of checkpoints', 'Checkpoints'],
    ['Estimated memory usage', 'Memory'],
    ['Storage size', 'Size'],
    ['TIMESTAMP', 'TIMESTAMP'],
    ['COMPONENT', 'COMPONENT'],
    ['ENDPOINT NAME', 'ENDPOINT'],
    ['CONVERSATION ID', 'CONVERSATION ID'],
    ['CORRELATION ID', 'CORRELATION ID'],
    ['NR OF CHECKPOINTS', 'NR OF CHECKPOINTS'],
    ['STATUS', 'STATUS'],
  ]);

  tableSettings: TableSettings = {
    reportMetadata: [],
    metadataHeaders: [],
    tableLoaded: false,
    displayAmount: this.DEFAULT_DISPLAY_AMOUNT,
    showFilter: false,
    filterValue: '(.*)',
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
  selectedRow: number = -1;
  doneRetrieving: boolean = false;
  @Output() openReportInSeparateTabEvent = new EventEmitter<any>();
  tableSpacing!: number;
  tableSpacingSubscription!: Subscription;

  constructor(
    private httpService: HttpService,
    public helperService: HelperService,
    private cookieService: CookieService,
    private changeNodeLinkStrategyService: ChangeNodeLinkStrategyService,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.cookieService.set('transformationEnabled', 'true');
    this.loadData();
    this.listenForViewUpdate();
    this.subscribeToSettingsObservables();
  }

  ngOnDestroy(): void {
    this.tableSpacingSubscription.unsubscribe();
  }

  subscribeToSettingsObservables(): void {
    this.tableSpacingSubscription = this.settingsService.tableSpacingObservable.subscribe((value: number): void => {
      this.tableSpacing = value;
    });
  }

  retrieveRecords() {
    this.doneRetrieving = false;
    this.tableSettings.reportMetadata = [];
    const httpServiceSubscription = this.httpService
      .getMetadataReports(
        this.tableSettings.displayAmount,
        this.tableSettings.filterValue,
        this.tableSettings.filterHeader,
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
          this.doneRetrieving = true;
          httpServiceSubscription.unsubscribe();
        },
        error: () => {
          catchError(this.httpService.handleError());
        },
      });

    this.getUserHelp();
    this.loadMetadataCount();
  }

  getUserHelp() {
    this.httpService
      .getUserHelp(this.viewSettings.currentView.storageName, this.viewSettings.currentView.metadataNames)
      .subscribe({
        next: (response) => {
          this.tableSettings.metadataHeaders = response;
        },
      });
  }

  clearFilters() {
    let element: NodeListOf<HTMLInputElement> = document.querySelectorAll('#filter')!;
    element.forEach((element: HTMLInputElement) => {
      element.value = '';
    });

    this.tableSettings.filterValue = '';
    this.tableSettings.filterHeader = '';
    this.retrieveRecords();
  }

  changeView(event: any) {
    this.allRowsSelected = false;
    this.viewSettings.currentView = this.viewSettings.views[event.target.value];
    this.viewSettings.currentView.name = event.target.value;
    this.clearFilters();
    this.changeViewEvent.emit(this.viewSettings.currentView);
    this.selectedRow = -1;
  }

  listenForViewUpdate() {
    this.changeNodeLinkStrategyService.changeNodeLinkStrategy.subscribe(() => {
      this.httpService.getViews().subscribe((views) => {
        this.viewSettings.views = views;
        let viewToUpdate = Object.keys(this.viewSettings.views).find(
          (view) => view === this.viewSettings.currentView.name
        );
        if (viewToUpdate) {
          this.viewSettings.currentView.nodeLinkStrategy = views[viewToUpdate].nodeLinkStrategy;
        }
      });
    });
  }

  loadData(): void {
    this.httpService.getViews().subscribe((views) => {
      if (Object.keys(this.viewSettings.currentView).length > 0) {
        this.changeViewEvent.emit(this.viewSettings.currentView);
      } else {
        this.viewSettings.views = views;
        this.viewSettings.currentViewName = Object.keys(this.viewSettings.views).find(
          (view) => this.viewSettings.views[view].defaultView
        );

        this.viewSettings.currentView = this.viewSettings.views[this.viewSettings.currentViewName];
        this.viewSettings.currentView.name = this.viewSettings.currentViewName;
        this.changeViewEvent.emit(this.viewSettings.currentView);
      }

      this.retrieveRecords();
      this.getUserHelp();
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

  openSettingsModal(): void {
    this.tableSettingsModal.open();
  }

  toggleFilter(): void {
    this.tableSettings.showFilter = !this.tableSettings.showFilter;
  }

  toggleCheck(report: any): void {
    console.log(report);
    report.checked = !report.checked;
    if (this.allRowsSelected && !report.checked) {
      this.allRowsSelected = false;
    }
    this.allRowsSelected = this.checkIfAllRowsSelected();
  }

  checkIfAllRowsSelected() {
    for (let reportMetada of this.tableSettings.reportMetadata) {
      if (!reportMetada.checked) {
        return false;
      }
    }
    return true;
  }

  selectAllRows(): void {
    this.allRowsSelected = !this.allRowsSelected;
    if (this.allRowsSelected) {
      this.selectAll();
    } else {
      this.deselectAll();
    }
  }

  getStatusColor(metadata: any): string {
    let statusName = this.viewSettings.currentView.metadataNames.find((name: string) => {
      return name.toLowerCase() === 'status';
    });
    if (statusName && metadata[statusName]) {
      if (metadata[statusName].toLowerCase() === 'success') {
        return '#c3e6cb';
      } else if (metadata[statusName].toLowerCase() === 'error') {
        return '#A9A9A9FF';
      } else {
        return '#f79c9c';
      }
    }
    return 'none';
  }

  showCompareButton(): boolean {
    return this.tableSettings.reportMetadata.filter((report) => report.checked).length == 2;
  }

  showOpenInTabButton(): boolean {
    return this.tableSettings.reportMetadata.filter((report) => report.checked).length == 1;
  }

  openReportInTab(): void {
    let reportTab = this.tableSettings.reportMetadata.find((report) => report.checked);
    this.httpService.getReport(reportTab.storageId, this.viewSettings.currentView.storageName).subscribe((data) => {
      let report: Report = data.report;
      report.xml = data.xml;
      this.openReportInSeparateTabEvent.emit({
        data: report,
        name: report.name,
      });
    });
  }

  openSelected(): void {
    this.tableSettings.reportMetadata.forEach((report) => {
      if (report.checked) {
        this.openReport(report.storageId);
      }
    });
  }

  deleteSelected(): void {
    const reportIds = this.helperService.getSelectedIds(this.tableSettings.reportMetadata);
    this.httpService.deleteReport(reportIds, this.viewSettings.currentView.storageName).subscribe(() => {
      this.retrieveRecords();
    });
  }

  selectAll(): void {
    this.tableSettings.reportMetadata.forEach((report) => (report.checked = true));
  }

  deselectAll(): void {
    this.tableSettings.reportMetadata.forEach((report) => (report.checked = false));
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
          viewName: this.viewSettings.currentView.name,
          nodeLinkStrategy: this.viewSettings.currentView.nodeLinkStrategy,
        };
      },

      complete: () => {
        this.openSelectedCompareReportsEvent.emit(compareReports);
      },
    });
  }

  changeFilter(event: any, header: string): void {
    const filterValue = event.target.value;
    this.tableSettings.filterValue = filterValue === '' ? '.*' : filterValue;
    this.tableSettings.filterHeader = filterValue === '' ? '' : header;
    this.retrieveRecords();
  }

  changeTableLimit(event: any): void {
    this.tableSettings.displayAmount = event.target.value === '' ? 0 : event.target.value;
    this.retrieveRecords();
    this.allRowsSelected = false;
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
      report.storageName = this.viewSettings.currentView.storageName;
      this.openReportEvent.next(report);
    });
  }

  highLightRow(event: any) {
    this.selectedRow = event;
  }

  openLatestReports(amount: number): void {
    this.httpService.getLatestReports(amount, this.viewSettings.currentView.storageName).subscribe((data) => {
      data.forEach((report: any) => {
        this.openReportEvent.next(report);
      });
    });
  }

  openReportInProgress(index: number) {
    this.httpService.getReportInProgress(index).subscribe((report) => {
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
    const queryString: string = this.tableSettings.reportMetadata
      .filter((report) => report.checked)
      .reduce((totalQuery: string, selectedReport: any) => totalQuery + 'id=' + selectedReport.storageId + '&', '');
    if (queryString === '') {
      this.toastComponent.addAlert({
        type: 'warning',
        message: 'No reports selected to download',
      });
    } else {
      this.helperService.download(queryString, this.viewSettings.currentView.storageName, exportBinary, exportXML);
    }
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
        this.openReportEvent.next(report);
      }
    });
  }

  //TODO: fix on backend
  getShortenedTableHeaderNames(fullName: string): string {
    if (this.shortenedTableHeaders.has(fullName)) {
      return this.shortenedTableHeaders.get(fullName) as string;
    }
    return fullName;
  }

  getTableSpacing() {
    return `${this.tableSpacing * 0.25}em 0 ${this.tableSpacing * 0.25}em 0`;
  }

  getFontSize() {
    return `${8 + this.tableSpacing * 1.2}pt`;
  }

  getCheckBoxSize() {
    return `${13 + this.tableSpacing}px`;
  }
}
