import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { HelperService } from '../../shared/services/helper.service';
import { HttpService } from '../../shared/services/http.service';
import { TableSettingsModalComponent } from './table-settings-modal/table-settings-modal.component';
import { TableSettings } from '../../shared/interfaces/table-settings';
import { catchError, Subject, Subscription } from 'rxjs';
import { Report } from '../../shared/interfaces/report';
import { SettingsService } from '../../shared/services/settings.service';
import { ToastService } from '../../shared/services/toast.service';
import { TabService } from '../../shared/services/tab.service';
import { FilterService } from '../filter-side-drawer/filter.service';
import { ReportData } from '../../shared/interfaces/report-data';
import { TableCellShortenerPipe } from '../../shared/pipes/table-cell-shortener.pipe';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActiveFiltersComponent } from '../active-filters/active-filters.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { FilterSideDrawerComponent } from '../filter-side-drawer/filter-side-drawer.component';
import { KeyValuePipe, NgClass } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { View } from '../../shared/interfaces/view';
import { OptionsSettings } from '../../shared/interfaces/options-settings';
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';
import { CompareReport } from '../../shared/interfaces/compare-reports';
import { DebugTabService } from '../debug-tab.service';
import { ViewDropdownComponent } from '../../shared/components/view-dropdown/view-dropdown.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  standalone: true,
  imports: [
    FilterSideDrawerComponent,
    ButtonComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    ReactiveFormsModule,
    FormsModule,
    ActiveFiltersComponent,
    MatProgressSpinnerModule,
    MatSortModule,
    NgClass,
    TableSettingsModalComponent,
    ToastComponent,
    KeyValuePipe,
    TableCellShortenerPipe,
    MatTableModule,
    ViewDropdownComponent,
  ],
})
export class TableComponent implements OnInit, OnDestroy {
  private readonly DEFAULT_DISPLAY_AMOUNT: number = 10;

  @Input({ required: true }) views!: View[];
  @Input({ required: true }) currentView!: View;

  @Output() viewChange: Subject<View> = new Subject<View>();
  @Output() openReportEvent: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(TableSettingsModalComponent) tableSettingsModal!: TableSettingsModalComponent;

  @ViewChild(MatSort) set matSort(sort: MatSort) {
    this.tableDataSort = sort;
    this.tableDataSource.sort = this.tableDataSort;
  }

  protected metadataCount: number = 0;
  protected amountOfSelectedReports: number = 0;
  protected tableSpacing?: string;
  protected fontSize?: string;
  protected checkboxSize?: string;

  protected shortenedTableHeaders: Map<string, string> = new Map([
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

  protected tableSettings: TableSettings = {
    reportMetadata: [],
    tableLoaded: false,
    displayAmount: this.DEFAULT_DISPLAY_AMOUNT,
    showFilter: false,
    currentFilters: new Map<string, string>(),
    numberOfReportsInProgress: 0,
    estimatedMemoryUsage: '',
    uniqueValues: new Map<string, Array<string>>(),
  };

  showMultipleFiles?: boolean;
  showFilterError: boolean = false;
  filterErrorDetails: Map<string, string> = new Map<string, string>();
  hasTimedOut: boolean = false;
  reportsInProgress: Record<string, number> = {};
  reportsInProgressThreshold!: number;
  tableDataSource: MatTableDataSource<Report> = new MatTableDataSource<Report>();
  tableDataSort?: MatSort;
  protected selectedReportStorageId?: number;

  private readonly subscriptions: Subscription = new Subscription();

  constructor(
    private httpService: HttpService,
    public helperService: HelperService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private tabService: TabService,
    private filterService: FilterService,
    private errorHandler: ErrorHandling,
    private debugTab: DebugTabService,
  ) {}

  ngOnInit(): void {
    localStorage.setItem('transformationEnabled', 'true');
    this.filterService.setMetadataTypes(this.currentView.metadataTypes);
    this.subscribeToObservables();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  subscribeToObservables(): void {
    const tableSpacingSubscription: Subscription = this.settingsService.tableSpacingObservable.subscribe({
      next: (value: number) => {
        this.setTableSpacing(value);
        this.setFontSize(value);
        this.setCheckBoxSize(value);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(tableSpacingSubscription);
    const showMultipleSubscription: Subscription = this.settingsService.showMultipleAtATimeObservable.subscribe({
      next: (value: boolean) => (this.showMultipleFiles = value),
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(showMultipleSubscription);
    const showFilterSubscription: Subscription = this.filterService.showFilter$.subscribe({
      next: (show: boolean) => (this.tableSettings.showFilter = show),
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(showFilterSubscription);
    const filterErrorSubscription: Subscription = this.filterService.filterError$.subscribe({
      next: (filterError: [boolean, Map<string, string>]): void => {
        this.showFilterError = filterError[0];
        this.filterErrorDetails = filterError[1];
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(filterErrorSubscription);
    const filterContextSubscription: Subscription = this.filterService.filterContext$.subscribe({
      next: (context: Map<string, string>) => this.changeFilter(context),
      error: () => catchError(this.errorHandler.handleError()),
    });
    this.subscriptions.add(filterContextSubscription);
    const refresh = this.debugTab.refresh$.subscribe(() => this.refresh());
    this.subscriptions.add(refresh);
  }

  setTableSpacing(value: number): void {
    this.tableSpacing = `${value * 0.25}em 0 ${value * 0.25}em 0`;
  }

  setFontSize(value: number): void {
    const fontSizeSpacingModifier: number = 1.2;
    const defaultFontSize: number = 8;
    this.fontSize = `${defaultFontSize + value * fontSizeSpacingModifier}pt`;
  }

  setCheckBoxSize(value: number): void {
    const defaultCheckBoxSize: number = 13;
    this.checkboxSize = `${defaultCheckBoxSize + value}px`;
  }

  changeFilter(filters: Map<string, string>): void {
    for (let value of filters.values()) {
      if (!value) {
        value = '';
      }
    }
    this.tableSettings.currentFilters = filters;

    this.retrieveRecords();
  }

  loadData(): void {
    this.retrieveRecords();
    this.loadMetadataCount();
    this.loadReportInProgressThreshold();
    this.loadReportInProgressSettings();
  }

  retrieveRecords() {
    this.httpService.getMetadataReports(this.tableSettings, this.currentView).subscribe({
      next: (value: Report[]) => {
        this.setUniqueOptions(value);
        this.tableSettings.reportMetadata = value;
        this.tableDataSource.data = value;
        this.tableSettings.tableLoaded = true;
        this.toastService.showSuccess('Data loaded!');
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  changeView(view: View): void {
    this.currentView = view;
    this.retrieveRecords();
    this.filterService.setMetadataLabels(this.currentView.metadataLabels);
    this.viewChange.next(this.currentView);
  }

  loadMetadataCount(): void {
    this.httpService.getMetadataCount(this.currentView.storageName).subscribe({
      next: (count: number) => (this.metadataCount = count),
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  loadReportInProgressThreshold(): void {
    this.httpService.getReportsInProgressThresholdTime().subscribe({
      next: (time: number) => (this.reportsInProgressThreshold = time),
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  loadReportInProgressSettings(): void {
    this.httpService.getSettings().subscribe({
      next: (settings: OptionsSettings) => {
        this.tableSettings.numberOfReportsInProgress = settings.reportsInProgress;
        this.tableSettings.estimatedMemoryUsage = settings.estMemory;
        this.loadReportInProgressDates();
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  loadReportInProgressDates(): void {
    let hasChanged: boolean = false;
    for (let index = 1; index <= this.tableSettings.numberOfReportsInProgress; index++) {
      this.httpService.getReportInProgress(index).subscribe({
        next: (report: Report) => {
          this.reportsInProgress[report.correlationId] ??= report.startTime;
          if (this.reportsInProgressMetThreshold(report)) {
            this.hasTimedOut = true;
            hasChanged = true;
          }
        },
        error: () => catchError(this.errorHandler.handleError()),
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

  toggleFilter(): void {
    this.filterService.setMetadataLabels(this.currentView.metadataNames);
    this.filterService.setMetadataTypes(this.currentView.metadataTypes);
    this.tableSettings.showFilter = !this.tableSettings.showFilter;
    this.filterService.setShowFilter(this.tableSettings.showFilter);
    this.filterService.setCurrentRecords(this.tableSettings.uniqueValues);
  }

  toggleCheck(report: Report, event: MouseEvent): void {
    event.stopPropagation();
    report.checked = !report.checked;
    if (report.checked) {
      this.amountOfSelectedReports++;
    } else {
      this.amountOfSelectedReports--;
    }
  }

  toggleSelectAll(): void {
    if (this.amountOfSelectedReports === this.tableSettings.reportMetadata.length) {
      this.setCheckedForAllReports(false);
      this.amountOfSelectedReports = 0;
    } else {
      this.setCheckedForAllReports(true);
      this.amountOfSelectedReports = this.tableSettings.reportMetadata.length;
    }
  }

  setCheckedForAllReports(value: boolean): void {
    for (const report of this.tableSettings.reportMetadata) {
      report.checked = value;
    }
  }

  getStatusColor(metadata: any): string {
    let statusName = this.currentView.metadataNames.find((name: string) => {
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

  openReportInTab(): void {
    const reportTab: Report | undefined = this.tableSettings.reportMetadata.find((report: Report) => report.checked);
    if (!reportTab) {
      this.toastService.showDanger('Could not find report that was selected.');
      return;
    }
    this.httpService.getReport(reportTab.storageId, this.currentView.storageName).subscribe({
      next: (report: Report): void => {
        const reportData: ReportData = {
          report: report,
          currentView: this.currentView!,
        };
        this.tabService.openNewTab(reportData);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  openSelected(): void {
    if (this.amountOfSelectedReports > 1 && !this.showMultipleFiles) {
      this.toastService.showWarning(
        'Please enable show multiple files in settings to open multiple files in the debug tree',
      );
      return;
    }
    const selectedReports: number[] = this.tableSettings.reportMetadata
      .filter((report: Report) => report.checked)
      .map((report: Report) => report.storageId);
    this.httpService.getReports(selectedReports, this.currentView.storageName).subscribe({
      next: (data: Record<string, CompareReport>) => {
        for (const report of selectedReports) {
          data[report].report.xml = data[report].xml;
          data[report].report.storageName = this.currentView.storageName;
          this.openReportEvent.next(data[report].report);
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  deleteSelected(): void {
    const reportIds = this.helperService.getSelectedIds(this.tableSettings.reportMetadata);
    if (reportIds.length > 0) {
      this.httpService.deleteReport(reportIds, this.currentView.storageName).subscribe({
        next: () => this.retrieveRecords(),
        error: () => catchError(this.errorHandler.handleError()),
      });
    }
  }

  compareTwoReports(): void {
    const selectedReports: number[] = this.tableSettings.reportMetadata
      .filter((report) => report.checked)
      .map((report) => report.storageId);

    this.httpService.getReports(selectedReports, this.currentView.storageName).subscribe({
      next: (data: Record<string, CompareReport>) => {
        const leftObject = data[selectedReports[0]];
        const originalReport = leftObject.report;
        originalReport.xml = leftObject.xml;

        const rightObject = data[selectedReports[1]];
        const runResultReport = rightObject.report;
        runResultReport.xml = rightObject.xml;

        const id = this.helperService.createCompareTabId(originalReport, runResultReport);

        this.tabService.openNewCompareTab({
          id: id,
          originalReport: originalReport,
          runResultReport: runResultReport,
          viewName: this.currentView.name,
        });
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  changeTableLimit(event: any): void {
    this.tableSettings.displayAmount = event.target.value === '' ? 0 : event.target.value;
    this.retrieveRecords();
  }

  refresh(): void {
    this.filterService.setShowFilter(false);
    this.tableSettings.displayAmount = 10;
    if (this.tableDataSort) {
      //Resets the sort
      //Needed because of a known issue with the Angular matSort
      //https://github.com/angular/components/issues/10242
      this.tableDataSort.sort({ id: '', start: 'desc', disableClear: false });
    }
    this.loadData();
  }

  openReport(storageId: number): void {
    this.httpService.getReport(storageId, this.currentView.storageName).subscribe({
      next: (data: Report): void => {
        data.storageName = this.currentView.storageName;
        this.openReportEvent.next(data);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  openSelectedReport(storageId: number) {
    this.selectedReportStorageId = storageId;
    this.openReport(storageId);
  }

  openLatestReports(amount: number): void {
    this.httpService.getLatestReports(amount, this.currentView.storageName).subscribe({
      next: (data: Report[]) => {
        for (let report of data) {
          this.openReportEvent.next(report);
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  openReportInProgress(index: number): void {
    this.httpService.getReportInProgress(index).subscribe({
      next: (report: Report) => {
        this.openReportEvent.next(report);
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  deleteReportInProgress(index: number): void {
    this.httpService.deleteReportInProgress(index).subscribe({
      error: () => catchError(this.errorHandler.handleError()),
      complete: () => {
        this.loadReportInProgressSettings();
      },
    });
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    const selectedReports = this.tableSettings.reportMetadata.filter((report) => report.checked);

    if (selectedReports.length > 0) {
      let queryString: string = '';
      for (let report of selectedReports) {
        queryString += `id=${report.storageId}&`;
      }
      this.helperService.download(queryString, this.currentView.storageName, exportBinary, exportXML);
    } else {
      this.toastService.showWarning('No reports selected to download');
    }
  }

  uploadReports(event: Event): void {
    const eventTarget = event.target as HTMLInputElement;
    const file: File | undefined = eventTarget.files?.[0];
    if (file) {
      const formData: FormData = new FormData();
      formData.append('file', file);
      this.showUploadedReports(formData);
    }
  }

  showUploadedReports(formData: FormData): void {
    this.httpService.uploadReport(formData).subscribe({
      next: (data: Report[]) => {
        for (let report of data) {
          const reportData: ReportData = {
            report: report,
            currentView: this.currentView,
          };
          this.tabService.openNewTab(reportData);
        }
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  setUniqueOptions(data: any): void {
    for (const headerName of this.currentView.metadataNames as string[]) {
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
      return a.localeCompare(b);
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

  getMetadata(report: Report, field: string): string {
    return report[field as keyof Report];
  }

  getMetadataNameFromHeader(header: string): string {
    const index = this.currentView.metadataLabels.indexOf(header);
    return this.currentView.metadataNames[index];
  }

  getDisplayedColumnNames(labels: string[]): string[] {
    const names: string[] = ['select'];
    for (const header of labels) {
      names.push(this.getMetadataNameFromHeader(header));
    }
    return names;
  }
}
