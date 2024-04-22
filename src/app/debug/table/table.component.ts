import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { HttpService } from '../../shared/services/http.service';
import { TableSettingsModalComponent } from './table-settings-modal/table-settings-modal.component';
import { TableSettings } from '../../shared/interfaces/table-settings';
import { catchError, Subject, Subscription } from 'rxjs';
import { Report } from '../../shared/interfaces/report';
import { ChangeNodeLinkStrategyService } from '../../shared/services/node-link-strategy.service';
import { SettingsService } from '../../shared/services/settings.service';
import { ToastService } from '../../shared/services/toast.service';
import { DebugReportService } from '../debug-report.service';
import { TabService } from '../../shared/services/tab.service';

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
  //Temporary fix, issue has been created (https://github.com/wearefrank/ladybug-frontend/issues/383) to refactor this and the debug component
  @Output() viewChange: Subject<string> = new Subject<string>();

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
    numberOfReportsInProgress: 0,
    estimatedMemoryUsage: '',
    uniqueValues: new Map<string, Array<string>>(),
  };
  @Output() openReportEvent = new EventEmitter<any>();
  @ViewChild(TableSettingsModalComponent)
  tableSettingsModal!: TableSettingsModalComponent;
  selectedRow: number = -1;
  doneRetrieving: boolean = false;
  tableSpacing!: number;
  tableSpacingSubscription!: Subscription;
  showMultipleFiles!: boolean;
  showMultipleFilesSubscription!: Subscription;
  viewDropdownBoxWidth!: string;
  currentFilters: Map<string, string> = new Map<string, string>();

  defaultCheckBoxSize: number = 13;
  defaultFontSize: number = 8;
  fontSizeSpacingModifier: number = 1.2;
  hasTimedOut: boolean = false;
  reportsInProgress: Record<string, number> = {};
  reportsInProgressThreshold!: number;

  constructor(
    private httpService: HttpService,
    public helperService: HelperService,
    private changeNodeLinkStrategyService: ChangeNodeLinkStrategyService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private debugReportService: DebugReportService,
    private tabService: TabService,
  ) {}

  ngOnInit(): void {
    localStorage.setItem('transformationEnabled', 'true');
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
    this.showMultipleFilesSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe(
      (value: boolean) => {
        this.showMultipleFiles = value;
      },
    );
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
        this.viewSettings.currentView.storageName,
      )
      .subscribe({
        next: (value) => {
          this.setUniqueOptions(value);
          this.tableSettings.reportMetadata = value;
          this.tableSettings.tableLoaded = true;
          this.toastService.showSuccess('Data loaded!');
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
    this.viewSettings.currentViewName = event.target.value;
    this.clearFilters();
    this.debugReportService.changeView(this.viewSettings.currentView);
    this.selectedRow = -1;
    this.viewChange.next(this.viewSettings.currentViewName);
  }

  listenForViewUpdate() {
    this.changeNodeLinkStrategyService.changeNodeLinkStrategy.subscribe(() => {
      this.httpService.getViews().subscribe((views) => {
        this.viewSettings.views = views;
        this.sortFilterList();
        let viewToUpdate = Object.keys(this.viewSettings.views).find(
          (view) => view === this.viewSettings.currentView.name,
        );
        if (viewToUpdate) {
          this.viewSettings.currentView.nodeLinkStrategy = views[viewToUpdate].nodeLinkStrategy;
        }
      });
    });
  }

  loadData(): void {
    this.loadReportInProgressThreshold();
    this.httpService.getViews().subscribe((views) => {
      if (Object.keys(this.viewSettings.currentView).length > 0) {
        this.debugReportService.changeView(this.viewSettings.currentView);
      } else {
        this.viewSettings.views = views;
        this.calculateViewDropDownWidth();
        this.viewSettings.currentViewName = Object.keys(this.viewSettings.views).find(
          (view) => this.viewSettings.views[view].defaultView,
        );

        this.viewSettings.currentView = this.viewSettings.views[this.viewSettings.currentViewName];
        this.viewSettings.currentView.name = this.viewSettings.currentViewName;
        this.debugReportService.changeView(this.viewSettings.currentView);
      }

      this.retrieveRecords();
      this.getUserHelp();
    });

    this.loadReportInProgressSettings();
  }

  loadMetadataCount() {
    this.httpService.getMetadataCount(this.viewSettings.currentView.storageName).subscribe((count: number) => {
      this.metadataCount = count;
    });
  }

  loadReportInProgressSettings() {
    this.httpService.getSettings().subscribe({
      next: (settings) => {
        this.tableSettings.numberOfReportsInProgress = settings.reportsInProgress;
        this.tableSettings.estimatedMemoryUsage = settings.estMemory;
        this.loadReportInProgressDates();
      },
    });
  }

  loadReportInProgressDates() {
    let hasChanged: boolean = false;
    for (let index = 1; index <= this.tableSettings.numberOfReportsInProgress; index++) {
      this.httpService.getReportInProgress(index).subscribe((report: Report) => {
        this.reportsInProgress[report.correlationId] ??= report.startTime;
        if (this.reportsInProgressMetThreshold(report)) {
          this.hasTimedOut = true;
          hasChanged = true;
        }
      });
    }
    if (!hasChanged) {
      this.hasTimedOut = false;
    }
  }

  reportsInProgressMetThreshold(report: Report): boolean {
    return (
      Date.now() - new Date(this.reportsInProgress[report.correlationId]).getTime() > this.reportsInProgressThreshold
    );
  }

  openSettingsModal(): void {
    this.tableSettingsModal.open();
  }

  toggleFilter(): void {
    this.tableSettings.showFilter = !this.tableSettings.showFilter;
  }

  toggleCheck(report: any): void {
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
      } else if (metadata[statusName].toLowerCase() === 'null') {
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
      this.tabService.openNewTab({
        data: report,
        name: report.name,
      });
    });
  }

  openSelected(): void {
    for (const report of this.tableSettings.reportMetadata) {
      if (report.checked) {
        this.openReport(report.storageId);
        if (!this.showMultipleFiles) {
          this.toastService.showWarning(
            'Please enable show multiple files in settings to open multiple files in the debug tree',
          );
          break;
        }
      }
    }
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

  compareTwoReports(): void {
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
        this.tabService.openNewCompareTab(compareReports);
      },
    });
  }

  changeFilter(event: any, header: string, value?: string): void {
    const filterValue: string = value ?? event.target.value;
    if (this.currentFilters.get(header) !== filterValue) {
      this.tableSettings.filterValue = filterValue ?? '.*';
      this.tableSettings.filterHeader = filterValue;
      this.tableSettings.filterHeader &&= header;
      this.retrieveRecords();
      this.currentFilters.set(header, filterValue);
      this.currentFilters = new Map(this.currentFilters);
    }
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

  highLightRow(event: any): void {
    this.selectedRow = event;
  }

  openLatestReports(amount: number): void {
    this.httpService.getLatestReports(amount, this.viewSettings.currentView.storageName).subscribe((data) => {
      data.forEach((report: any) => {
        this.openReportEvent.next(report);
      });
    });
  }

  openReportInProgress(index: number): void {
    this.httpService.getReportInProgress(index).subscribe((report) => {
      this.openReportEvent.next(report);
    });
  }

  deleteReportInProgress(index: number): void {
    this.httpService.deleteReportInProgress(index).subscribe({
      complete: () => {
        this.loadReportInProgressSettings();
      },
    });
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    const queryString: string = this.tableSettings.reportMetadata
      .filter((report) => report.checked)
      .reduce((totalQuery: string, selectedReport: any) => totalQuery + 'id=' + selectedReport.storageId + '&', '');
    if (queryString === '') {
      this.toastService.showWarning('No reports selected to download');
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

  showUploadedReports(formData: any): void {
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

  getTableSpacing(): string {
    return `${this.tableSpacing * 0.25}em 0 ${this.tableSpacing * 0.25}em 0`;
  }

  getFontSize(): string {
    return `${this.defaultFontSize + this.tableSpacing * this.fontSizeSpacingModifier}pt`;
  }

  getCheckBoxSize(): string {
    return `${this.defaultCheckBoxSize + this.tableSpacing}px`;
  }

  setUniqueOptions(data: any): void {
    for (const headerName of this.viewSettings.currentView.metadataLabels as string[]) {
      const lowerHeaderName = headerName.toLowerCase();
      const upperHeaderName = headerName.toUpperCase();
      let uniqueValues: Set<string> = new Set<string>();
      for (let element of data) {
        uniqueValues.add(element[lowerHeaderName]);
        uniqueValues.add(element[upperHeaderName]);
      }
      this.tableSettings.uniqueValues.set(
        lowerHeaderName,
        uniqueValues.size < 15 ? this.sortUniqueValues(uniqueValues) : ([] as string[]),
      );
    }
  }

  sortUniqueValues(values: Set<string>): string[] {
    //Sort list alphabetically, if string is actually a number, sort smallest to biggest
    return [...values].sort((a, b) => {
      // eslint-disable-next-line unicorn/prefer-number-properties
      const isANumber = !isNaN(Number(a));
      // eslint-disable-next-line unicorn/prefer-number-properties
      const isBNumber = !isNaN(Number(b));
      if (isANumber && isBNumber) {
        return Number(a) - Number(b);
      }
      if (isANumber && !isBNumber) {
        return -1;
      } else if (!isANumber && isBNumber) {
        return 1;
      }
      return String(a).localeCompare(String(b));
    });
  }

  sortFilterList(): void {
    for (let metadataLabel of this.viewSettings.currentView.metadataNames) {
      this.currentFilters.set(metadataLabel.toLowerCase().replaceAll(' ', ''), '');
    }
  }

  calculateViewDropDownWidth(): void {
    let longestViewName = '';
    for (let [key, value] of Object.entries(this.viewSettings.views)) {
      if (key.length > longestViewName.length) {
        longestViewName = key;
      }
    }
    this.viewDropdownBoxWidth = longestViewName.length / 2 + 'rem';
  }

  loadReportInProgressThreshold() {
    this.httpService.getReportsInProgressThresholdTime().subscribe((time: number) => {
      this.reportsInProgressThreshold = time;
    });
  }
}
