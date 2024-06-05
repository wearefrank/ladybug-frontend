import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ActiveFiltersComponent } from '../../active-filters/active-filters.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeyValuePipe } from '@angular/common';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../shared/services/http.service';
import { HelperService } from '../../../shared/services/helper.service';
import { ChangeNodeLinkStrategyService } from '../../../shared/services/node-link-strategy.service';
import { SettingsService } from '../../../shared/services/settings.service';
import { ToastService } from '../../../shared/services/toast.service';
import { DebugReportService } from '../../debug-report.service';
import { TabService } from '../../../shared/services/tab.service';
import { FilterService } from '../../filter-side-drawer/filter.service';
import { TableSettingsModalComponent } from '../table-settings-modal/table-settings-modal.component';
import { TableSettingsService } from '../table-settings.service';
import { TableSettings } from '../../../shared/interfaces/table-settings';
import { Subject, Subscription } from 'rxjs';
import { ViewSettings } from '../../../shared/interfaces/view-settings';
import { ReportData } from '../../../shared/interfaces/report-data';
import { Report } from '../../../shared/interfaces/report';

@Component({
  selector: 'app-table-menu',
  standalone: true,
  imports: [
    ActiveFiltersComponent,
    ButtonComponent,
    FormsModule,
    KeyValuePipe,
    NgbDropdown,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    NgbDropdownMenu,
    NgbDropdownToggle,
    ReactiveFormsModule,
    TableSettingsModalComponent,
  ],
  templateUrl: './table-menu.component.html',
  styleUrl: './table-menu.component.css',
})
export class TableMenuComponent implements OnInit, OnDestroy {
  DEFAULT_DISPLAY_AMOUNT: number = 10;
  tableSettingsSubscription?: Subscription;
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
  viewSettingsSubscription?: Subscription;
  viewSettings: ViewSettings = {
    defaultView: '',
    views: {},
    currentView: {},
    currentViewName: '',
  };
  showMultipleFilesSubscription?: Subscription;
  showMultipleFiles!: boolean;
  allRowsSelectedSubscription?: Subscription;
  allRowsSelected: boolean = false;
  metadataCountSubscription?: Subscription;
  metadataCount: number = 0;
  currentFiltersSubscription?: Subscription;
  currentFilters?: Record<string, string>;
  showFilterSubscription?: Subscription;
  showFilter: boolean = false;
  hasTimedOut: boolean = false;
  reportsInProgress: Record<string, number> = {};
  reportsInProgressThreshold!: number;
  @ViewChild(TableSettingsModalComponent)
  tableSettingsModal!: TableSettingsModalComponent;
  @Output() loadDataEvent: EventEmitter<void> = new EventEmitter();
  @Output() retrieveRecordsEvent: EventEmitter<void> = new EventEmitter();
  // openReportEvent is given the storageId of the report to open
  @Output() openReportEvent: EventEmitter<any> = new EventEmitter();
  @Output() openReportInProgressEvent: EventEmitter<any> = new EventEmitter();
  @Output() viewChangeSubject: Subject<string> = new Subject();

  constructor(
    private httpService: HttpService,
    public helperService: HelperService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private tabService: TabService,
    private filterService: FilterService,
    private tableSettingsService: TableSettingsService,
  ) {}

  ngOnInit(): void {
    this.tableSettingsSubscription = this.tableSettingsService.tableSettings$.subscribe(
      (tableSettings: TableSettings) => {
        this.tableSettings = tableSettings;
      },
    );
    this.viewSettingsSubscription = this.tableSettingsService.viewSettings$.subscribe((viewSettings: ViewSettings) => {
      this.viewSettings = viewSettings;
    });
    this.showMultipleFilesSubscription = this.settingsService.showMultipleAtATime$.subscribe((show: boolean) => {
      this.showMultipleFiles = show;
    });
    this.allRowsSelectedSubscription = this.tableSettingsService.allRowsSelected$.subscribe((allSelected: boolean) => {
      this.allRowsSelected = allSelected;
    });
    this.metadataCountSubscription = this.tableSettingsService.metadataCount$.subscribe((count: number) => {
      this.metadataCount = count;
    });
    this.currentFiltersSubscription = this.tableSettingsService.currentFilters$.subscribe(
      (currentFilters: Record<string, string>) => {
        this.currentFilters = currentFilters;
      },
    );
    this.showFilterSubscription = this.filterService.showFilter$.subscribe((show: boolean) => {
      this.showFilter = show;
    });
  }

  ngOnDestroy(): void {
    this.tableSettingsSubscription?.unsubscribe();
    this.viewSettingsSubscription?.unsubscribe();
    this.showMultipleFilesSubscription?.unsubscribe();
    this.allRowsSelectedSubscription?.unsubscribe();
    this.metadataCountSubscription?.unsubscribe();
    this.currentFiltersSubscription?.unsubscribe();
    this.showFilterSubscription?.unsubscribe();
  }

  openSettingsModal(): void {
    this.tableSettingsModal.open();
  }

  refresh(): void {
    this.filterService.setShowFilter(false);
    this.tableSettings.reportMetadata = [];
    this.tableSettings.tableLoaded = false;
    this.tableSettings.displayAmount = 10;
    this.tableSettingsService.setTableSettings(this.tableSettings);
    this.loadDataEvent.emit();
  }

  toggleFilter(): void {
    this.filterService.setMetadataLabels(this.viewSettings.currentView.metadataNames);
    this.filterService.setMetadataTypes(this.viewSettings.currentView.metadataTypes);
    this.tableSettings.showFilter = !this.tableSettings.showFilter;
    this.filterService.setShowFilter(this.tableSettings.showFilter);
    this.filterService.setCurrentRecords(this.tableSettings.uniqueValues);
    this.filterService.setShowFilter(this.tableSettings.showFilter);
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
      this.httpService.uploadReport(formData).subscribe((data) => {
        for (let report of data) {
          const reportData: ReportData = {
            report: report,
            currentView: this.viewSettings.currentView,
          };
          this.tabService.openNewTab(reportData);
        }
      });
    }
  }

  openSelected(): void {
    for (const report of this.tableSettings.reportMetadata) {
      if (report.checked) {
        this.openReportEvent.emit(report.storageId);
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
      this.retrieveRecordsEvent.emit();
    });
  }

  changeTableLimit(event: any): void {
    this.tableSettings.displayAmount = event.target.value === '' ? 0 : event.target.value;
    this.retrieveRecordsEvent.emit();
    this.allRowsSelected = false;
    this.tableSettingsService.setAllRowsSelected(this.allRowsSelected);
    this.tableSettingsService.setTableSettings(this.tableSettings);
  }

  viewChange(event: any): void {
    this.viewChangeSubject.next(event);
  }

  getViewDropDownWidth(): string {
    let longestViewName = '';
    for (let key of Object.keys(this.viewSettings.views)) {
      if (key.length > longestViewName.length) {
        longestViewName = key;
      }
    }
    return longestViewName.length / 2 + 'rem';
  }

  openReportInProgress(index: number): void {
    this.httpService.getReportInProgress(index).subscribe((report) => {
      this.openReportInProgressEvent.next(report);
    });
  }

  deleteReportInProgress(index: number): void {
    this.httpService.deleteReportInProgress(index).subscribe({
      complete: () => {
        this.loadReportInProgressSettings();
      },
    });
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

  getAmountOfReportsSelected(): number {
    return this.tableSettings.reportMetadata.filter((report) => report.checked).length;
  }

  openReportInTab(): void {
    let reportTab = this.tableSettings.reportMetadata.find((report) => report.checked);
    this.httpService
      .getReport(reportTab.storageId, this.viewSettings.currentView.storageName)
      .subscribe((report: Report): void => {
        const reportData: ReportData = {
          report: report,
          currentView: this.viewSettings.currentView,
        };
        this.tabService.openNewTab(reportData);
      });
  }

  compareTwoReports(): void {
    let compareReports: any = {};

    let selectedReports: string[] = this.tableSettings.reportMetadata
      .filter((report) => report.checked)
      .map((report) => report.storageId);
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
          viewName: this.viewSettings.currentView.name,
          nodeLinkStrategy: this.viewSettings.currentView.nodeLinkStrategy,
        };
      },

      complete: () => {
        this.tabService.openNewCompareTab(compareReports);
      },
    });
  }

  openLatestReports(amount: number): void {
    this.httpService.getLatestReports(amount, this.viewSettings.currentView.storageName).subscribe((data) => {
      data.forEach((report: any) => {
        this.openReportEvent.next(report);
      });
    });
  }
}
