import { Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ToastComponent } from '../toast/toast.component';
import { HelperService } from '../../services/helper.service';
import { HttpService } from '../../services/http.service';
import { LoaderService } from '../../services/loader.service';
import { TableSettingsModalComponent } from '../modals/table-settings-modal/table-settings-modal.component';
import { TableSettings } from '../../interfaces/table-settings';
import { CookieService } from 'ngx-cookie-service';
import {Metadata} from "../../interfaces/metadata";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, OnDestroy {
  DEFAULT_DISPLAY_AMOUNT: number = 10;
  HEADERS: string[] = ["Storage Id", "End Time", "Duration (ms)", "Name", "Status", "Correlation id", "Number of Checkpoints", "Estimated Memory Usage (Bytes)", "Storage Size (Bytes)"]
  tableSettings: TableSettings = {
    tableId: '', // this._id might not be defined yet
    reportMetadata: [],
    tableLoaded: false,
    displayAmount: this.DEFAULT_DISPLAY_AMOUNT,
    showFilter: false,
    filterValue: '',
  };
  @Output() openReportEvent = new EventEmitter<any>();
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
    private loaderService: LoaderService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    const tableSettings = this.loaderService.getTableSettings(this._id);
    if (!tableSettings.tableLoaded) {
      this.loadData();
    } else {
      this.tableSettings = tableSettings;
    }
  }

  ngOnDestroy(): void {
    this.loaderService.saveTableSettings(
      this._id,
      this.tableSettings.reportMetadata,
      this.tableSettings.showFilter,
      this.tableSettings.displayAmount,
      this.tableSettings.filterValue,
      this.tableSettings.tableLoaded
    );
  }

  loadData(): void {
    this.httpService.getReports(this.tableSettings.displayAmount).subscribe({
      next: (value) => {
        this.tableSettings.reportMetadata = value;
        this.tableSettings.tableLoaded = true;
        this.toastComponent.addAlert({
          type: 'success',
          message: 'Data loaded!',
        });
      },
      error: () => {
        this.toastComponent.addAlert({
          type: 'danger',
          message: 'Could not retrieve data for table',
        });
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

  changeFilter(event: any): void {
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
    this.httpService.getReport(storageId).subscribe((data) => {
      data.id = this.id;
      this.openReportEvent.next(data);
    });
  }

  openAllReports(): void {
    this.tableSettings.reportMetadata.forEach((report: Metadata) =>
      this.openReport(report.storageId)
    );
  }

  openReports(amount: number): void {
    this.tableSettings.reportMetadata
      .slice(0, amount)
      .forEach((report: Metadata) => this.openReport(report.storageId));
  }

  openLatestReports(amount: number): void {
    this.httpService.getLatestReports(amount).subscribe((data) => {
      data.forEach((report: any) => {
        report.id = this.id;
        this.openReportEvent.next(report);
      });
    });
  }

  downloadReports(exportBinary: boolean, exportXML: boolean): void {
    console.log(this.tableSettings.reportMetadata.values);
    const queryString: string = this.tableSettings.reportMetadata.reduce(
      (totalQuery: string, selectedReport: Metadata) =>
        totalQuery + 'id=' + selectedReport.storageId + '&',
      '?'
    );
    window.open('api/report/download/debugStorage/' + exportBinary + '/' + exportXML + queryString.slice(0, -1));
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
