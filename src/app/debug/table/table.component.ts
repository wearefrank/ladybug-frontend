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
import { FilterService } from '../filter-side-drawer/filter.service';
import { ReportData } from '../../shared/interfaces/report-data';
import { TableCellShortenerPipe } from '../../shared/pipes/table-cell-shortener.pipe';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActiveFiltersComponent } from '../active-filters/active-filters.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  NgbDropdown,
  NgbDropdownToggle,
  NgbDropdownMenu,
  NgbDropdownButtonItem,
  NgbDropdownItem,
} from '@ng-bootstrap/ng-bootstrap';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FilterSideDrawerComponent } from '../filter-side-drawer/filter-side-drawer.component';
import { NgIf, NgFor, NgClass, KeyValuePipe } from '@angular/common';
import { DebugListItem } from 'src/app/shared/interfaces/debug-list-item';
import { ViewSettings } from 'src/app/shared/interfaces/view-settings';
import { View } from 'src/app/shared/interfaces/view';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  standalone: true,
  imports: [
    NgIf,
    FilterSideDrawerComponent,
    ButtonComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    ReactiveFormsModule,
    FormsModule,
    NgFor,
    ActiveFiltersComponent,
    MatProgressSpinnerModule,
    MatSortModule,
    NgClass,
    TableSettingsModalComponent,
    ToastComponent,
    KeyValuePipe,
    TableCellShortenerPipe,
  ],
})
export class TableComponent implements OnInit, OnDestroy {
  DEFAULT_DISPLAY_AMOUNT: number = 10;
  metadataCount = 0;
  viewSettings: ViewSettings = {};
  selectedView?: View;
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
    filterValues: [],
    filterHeaders: [],
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
  tableSpacingSubscription?: Subscription;
  showMultipleFiles!: boolean;
  showMultipleFilesSubscription?: Subscription;
  viewDropdownBoxWidth!: string;
  currentFilters: Map<string, string> = new Map<string, string>();
  showFilterSubscription?: Subscription;
  filterContextSubscription?: Subscription;
  filterErrorSubscription?: Subscription;
  showFilterError: boolean = false;
  filterErrorDetails: Map<string, string> = new Map<string, string>();

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
    private filterService: FilterService,
  ) {}

  ngOnInit(): void {
    localStorage.setItem('transformationEnabled', 'true');
    this.loadData();
    this.listenForViewUpdate();
    this.subscribeToObservables();
  }

  ngOnDestroy(): void {
    this.unsubscribeFromObservables();
  }

  subscribeToObservables(): void {
    this.tableSpacingSubscription = this.settingsService.tableSpacingObservable.subscribe((value: number): void => {
      this.tableSpacing = value;
    });
    this.showMultipleFilesSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe(
      (value: boolean) => {
        this.showMultipleFiles = value;
      },
    );
    this.showFilterSubscription = this.filterService.showFilter$.subscribe((show: boolean): void => {
      this.tableSettings.showFilter = show;
    });
    this.filterErrorSubscription = this.filterService.filterError$.subscribe(
      (filterError: [boolean, Map<string, string>]): void => {
        this.showFilterError = filterError[0];
        this.filterErrorDetails = filterError[1];
      },
    );
    this.filterContextSubscription = this.filterService.filterContext$.subscribe(
      (context: Map<string, string>): void => {
        this.changeFilter(context);
      },
    );
  }

  unsubscribeFromObservables(): void {
    this.showFilterSubscription?.unsubscribe();
    this.filterContextSubscription?.unsubscribe();
    this.tableSpacingSubscription?.unsubscribe();
    this.showMultipleFilesSubscription?.unsubscribe();
    this.filterErrorSubscription?.unsubscribe();
  }

  checkMetadataAndStorageNames(): boolean {
    return this.viewSettings.currentView &&
      this.viewSettings.currentView.metadataNames &&
      this.viewSettings.currentView.storageName
      ? true
      : false;
  }

  retrieveRecords(): void {
    if (this.checkMetadataAndStorageNames()) {
      this.doneRetrieving = false;
      this.tableSettings.reportMetadata = [];
      const httpServiceSubscription = this.httpService
        .getMetadataReports(
          this.tableSettings.displayAmount,
          this.tableSettings.filterValues,
          this.tableSettings.filterHeaders,
          this.viewSettings.currentView!.metadataNames,
          this.viewSettings.currentView!.storageName,
        )
        .subscribe({
          next: (debugVariablesList: Record<string, string>[]) => {
            this.setUniqueOptions(debugVariablesList);
            this.makeDebugListItemArray(debugVariablesList);
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
  }

  makeDebugListItemArray(listOfItems: Record<string, string>[]) {
    for (const debugVariables of listOfItems) {
      const listItem: DebugListItem = {
        checked: false,
        debugVariables: debugVariables,
      };
      this.tableSettings.reportMetadata.push(listItem);
    }
  }

  getUserHelp(): void {
    if (this.checkMetadataAndStorageNames()) {
      this.httpService
        .getUserHelp(this.viewSettings.currentView!.storageName, this.viewSettings.currentView!.metadataNames)
        .subscribe({
          next: (response: Report[]) => {
            this.tableSettings.metadataHeaders = response;
          },
        });
    }
  }

  clearFilters(): void {
    this.tableSettings.filterValues = [];
    this.tableSettings.filterHeaders = [];
    this.retrieveRecords();
  }

  changeView(): void {
    if (this.viewSettings.views && this.selectedView) {
      this.allRowsSelected = false;
      this.viewSettings.currentView = this.viewSettings.views[this.selectedView.name];
      this.clearFilters();
      this.debugReportService.changeView(this.viewSettings.currentView);
      this.selectedRow = -1;
      if (this.viewSettings.currentView.metadataNames) {
        this.filterService.setMetadataLabels(this.viewSettings.currentView.metadataNames);
        this.viewChange.next(this.viewSettings.currentView.name);
      }
    }
  }

  listenForViewUpdate(): void {
    this.changeNodeLinkStrategyService.changeNodeLinkStrategy.subscribe(() => {
      this.httpService.getViews().subscribe((views) => {
        this.viewSettings.views = views;
        this.sortFilterList();
        let viewToUpdate = Object.keys(this.viewSettings.views).find(
          (view) => view === this.viewSettings.currentView?.name,
        );
        if (viewToUpdate && this.viewSettings.currentView) {
          this.viewSettings.currentView.nodeLinkStrategy = views[viewToUpdate].nodeLinkStrategy;
        }
      });
    });
  }

  loadData(): void {
    this.loadReportInProgressThreshold();
    this.httpService.getViews().subscribe((views: Record<string, View>) => {
      this.viewSettings.views = views;
      this.calculateViewDropDownWidth();

      this.setCurrentAndSelectedView(views);
      if (this.viewSettings.currentView) {
        this.debugReportService.changeView(this.viewSettings.currentView);
      }

      this.retrieveRecords();
      this.getUserHelp();

      if (this.viewSettings.currentView?.metadataTypes) {
        this.filterService.setMetadataTypes(this.viewSettings.currentView.metadataTypes);
      }
    });
    this.loadReportInProgressSettings();
  }

  setCurrentAndSelectedView(views: Record<string, View>): void {
    Object.keys(views).forEach((view) => {
      if (this.viewSettings.views?.[view].defaultView) {
        this.viewSettings.currentView = this.viewSettings.views?.[view];
        this.viewSettings.currentView.name = view;
        this.selectedView = this.viewSettings.views?.[view];
      }
    });
  }

  loadMetadataCount(): void {
    if (this.viewSettings.currentView?.storageName) {
      this.httpService.getMetadataCount(this.viewSettings.currentView.storageName).subscribe((count: number) => {
        this.metadataCount = count;
      });
    }
  }

  loadReportInProgressSettings(): void {
    this.httpService.getSettings().subscribe({
      next: (settings) => {
        this.tableSettings.numberOfReportsInProgress = settings.reportsInProgress;
        this.tableSettings.estimatedMemoryUsage = settings.estMemory;
        this.loadReportInProgressDates();
      },
    });
  }

  loadReportInProgressDates(): void {
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
    if (this.viewSettings.currentView?.metadataNames) {
      this.filterService.setMetadataLabels(this.viewSettings.currentView.metadataNames);
      this.filterService.setMetadataTypes(this.viewSettings.currentView.metadataTypes);
      this.tableSettings.showFilter = !this.tableSettings.showFilter;
      this.filterService.setShowFilter(this.tableSettings.showFilter);
      this.filterService.setCurrentRecords(this.tableSettings.uniqueValues);
    }
  }

  toggleCheck(report: any): void {
    report.checked = !report.checked;
    if (this.allRowsSelected && !report.checked) {
      this.allRowsSelected = false;
    }
    this.allRowsSelected = this.checkIfAllRowsSelected();
  }

  checkIfAllRowsSelected(): boolean {
    for (let reportMetadata of this.tableSettings.reportMetadata) {
      if (!reportMetadata.checked) {
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

  getStatusColor(metadata: DebugListItem): string {
    let statusName = this.viewSettings.currentView?.metadataNames.find((name: string) => {
      return name.toLowerCase() === 'status';
    });
    if (statusName && metadata.debugVariables[statusName]) {
      if (metadata.debugVariables[statusName].toLowerCase() === 'success') {
        return '#c3e6cb';
      } else if (metadata.debugVariables[statusName].toLowerCase() === 'null') {
        return '#A9A9A9FF';
      } else {
        return '#f79c9c';
      }
    }
    return 'none';
  }

  getAmountOfReportsSelected(): number {
    return this.tableSettings.reportMetadata.filter((report) => report.checked).length;
  }

  openReportInTab(): void {
    const reportTab: DebugListItem = this.tableSettings.reportMetadata.find((report: DebugListItem) => report.checked);
    if (
      reportTab &&
      this.viewSettings.currentView &&
      this.viewSettings.currentView.storageName &&
      reportTab.debugVariables.storageId
    ) {
      this.httpService
        .getReport(reportTab.debugVariables.storageId, this.viewSettings.currentView.storageName)
        .subscribe((report: Report): void => {
          const reportData: ReportData = {
            report: report,
            currentView: this.viewSettings.currentView!,
          };
          this.tabService.openNewTab(reportData);
        });
    }
  }

  openSelected(): void {
    for (const report of this.tableSettings.reportMetadata) {
      if (report.checked) {
        this.openReport(report.debugVariables.storageId);
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
    if (this.viewSettings.currentView) {
      const reportIds = this.helperService.getSelectedIds(this.tableSettings.reportMetadata);
      this.httpService.deleteReport(reportIds, this.viewSettings.currentView.storageName).subscribe(() => {
        this.retrieveRecords();
      });
    }
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
    if (this.viewSettings.currentView?.storageName) {
      this.httpService.getReports(selectedReports, this.viewSettings.currentView.storageName).subscribe({
        next: (data) => {
          const leftObject = data[selectedReports[0]];
          const originalReport = leftObject.report;
          originalReport.xml = leftObject.xml;

          const rightObject = data[selectedReports[1]];
          const runResultReport = rightObject.report;
          runResultReport.xml = rightObject.xml;

          const id = this.helperService.createCompareTabId(originalReport, runResultReport);
          compareReports = {
            id: id,
            originalReport: originalReport,
            runResultReport: runResultReport,
            viewName: this.viewSettings.currentView?.name ?? '',
            nodeLinkStrategy: this.viewSettings.currentView?.nodeLinkStrategy,
          };
        },

        complete: () => {
          this.tabService.openNewCompareTab(compareReports);
        },
      });
    }
  }

  changeFilter(filters: Map<string, string>): void {
    if (filters.size === 0) {
      this.tableSettings.filterValues = [];
      this.tableSettings.filterHeaders = [];
      this.currentFilters = new Map<string, string>();
    } else {
      this.tableSettings.filterValues = [...filters.values()];
      this.tableSettings.filterHeaders = [...filters.keys()];
      let current: Map<string, string> = new Map<string, string>();
      for (const [key, value] of filters.entries()) {
        if (key) {
          current.set(key, value ?? '');
        }
      }
      this.currentFilters = current;
    }
    this.retrieveRecords();
  }

  changeTableLimit(event: any): void {
    this.tableSettings.displayAmount = event.target.value === '' ? 0 : event.target.value;
    this.retrieveRecords();
    this.allRowsSelected = false;
  }

  refresh(): void {
    this.filterService.setShowFilter(false);
    this.tableSettings.reportMetadata = [];
    this.tableSettings.tableLoaded = false;
    this.tableSettings.displayAmount = 10;
    this.loadData();
  }

  openReport(storageId: string): void {
    if (storageId && this.viewSettings.currentView?.storageName) {
      this.httpService
        .getReport(storageId, this.viewSettings.currentView.storageName)
        .subscribe((data: Report): void => {
          data.storageName = this.viewSettings.currentView?.storageName ?? '';
          this.openReportEvent.next(data);
        });
    }
  }

  highLightRow(event: any): void {
    this.selectedRow = event;
  }

  openSelectedReport(storageId: string, index: number) {
    this.openReport(storageId);
    this.highLightRow(index);
  }

  openLatestReports(amount: number): void {
    if (this.viewSettings.currentView) {
      this.httpService.getLatestReports(amount, this.viewSettings.currentView.storageName).subscribe((data) => {
        data.forEach((report: any) => {
          this.openReportEvent.next(report);
        });
      });
    }
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
    const selectedReports: any = this.tableSettings.reportMetadata.filter((report) => report.checked);
    let queryString = '';

    for (const report of selectedReports) {
      queryString += `id=${report.storageId}`;
    }

    if (queryString === '') {
      this.toastService.showWarning('No reports selected to download');
    } else if (this.viewSettings.currentView) {
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
        const reportData: ReportData = {
          report: report,
          currentView: this.viewSettings.currentView ?? ({} as View),
        };
        this.tabService.openNewTab(reportData);
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
    for (const headerName of this.viewSettings.currentView?.metadataNames as string[]) {
      const lowerHeaderName = headerName.toLowerCase();
      const upperHeaderName = headerName.toUpperCase();
      let uniqueValues: Set<string> = new Set<string>();
      for (let element of data) {
        if (element[lowerHeaderName]) {
          uniqueValues.add(element[lowerHeaderName]);
        }
        if (element[upperHeaderName]) {
          uniqueValues.add(element[upperHeaderName]);
        }
        if (element[headerName]) {
          uniqueValues.add(element[headerName]);
        }
      }
      const MAX_AMOUNT_OF_FILTER_SUGGESTIONS: number = 15;
      this.tableSettings.uniqueValues.set(
        lowerHeaderName,
        uniqueValues.size < MAX_AMOUNT_OF_FILTER_SUGGESTIONS ? this.sortUniqueValues(uniqueValues) : [],
      );
      this.filterService.setCurrentRecords(this.tableSettings.uniqueValues);
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
    if (this.viewSettings.currentView) {
      for (let metadataLabel of this.viewSettings.currentView.metadataNames) {
        this.currentFilters.set(metadataLabel.toLowerCase().replaceAll(' ', ''), '');
      }
    }
  }

  calculateViewDropDownWidth(): void {
    if (this.viewSettings.views) {
      let longestViewName = '';
      for (let key of Object.keys(this.viewSettings.views)) {
        if (key.length > longestViewName.length) {
          longestViewName = key;
        }
      }
      this.viewDropdownBoxWidth = `{longestViewName.length / 2}rem`;
    }
  }

  loadReportInProgressThreshold(): void {
    this.httpService.getReportsInProgressThresholdTime().subscribe((time: number) => {
      this.reportsInProgressThreshold = time;
    });
  }

  handleFilterErrorContext(): string {
    let result: string = '';
    let moreThanOne: boolean = false;
    for (const [key, value] of this.filterErrorDetails) {
      let typeLabel: string = key;
      switch (typeLabel) {
        case 'int': {
          typeLabel = 'number';
          break;
        }
        case 'long': {
          typeLabel = 'decimal number';
          break;
        }
        case 'timestamp': {
          typeLabel = 'date time';
          break;
        }
        default: {
          typeLabel = 'text';
          break;
        }
      }
      if (moreThanOne) result += ', ';
      result += `Search value '${value}' is not a valid '${typeLabel}'`;
      moreThanOne = true;
    }
    return result;
  }
}
