import {Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit, OnDestroy} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastComponent} from "../toast/toast.component";
import {FormControl, FormGroup} from "@angular/forms";
import {HelperService} from "../../services/helper.service";
import {HttpService} from "../../services/http.service";
import {LoaderService} from "../../services/loader.service";
import {TableSettingsModalComponent} from "../modals/table-settings-modal/table-settings-modal.component";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit, OnDestroy {
  showFilter: boolean = false;
  reportMetadata: any = {};
  isPageLoaded: boolean = false;
  displayAmount: number = 10;
  filterValue: string = "";
  STORAGE_ID_INDEX = 5;
  @Output() openReportEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild(TableSettingsModalComponent) tableSettingsModal!: TableSettingsModalComponent;
  @Input() // Needed to make a distinction between the two halves in compare component
  get id() { return this._id }
  set id(id: string) { this._id = id }
  private _id: string = "";

  constructor(
    private httpService: HttpService,
    public helperService: HelperService,
    private loaderService: LoaderService) {
  }

  ngOnInit(): void {
    if (!this.loaderService.isTableLoaded()) {
      this.loadData()
    } else {
      this.reportMetadata = this.loaderService.getTableData();
      this.showFilter = this.loaderService.getShowFilter();
      this.isPageLoaded = true;
    }
  }

  loadData(): void {
    this.httpService.getReports(this.displayAmount)
      .subscribe({
        next: value => {
          this.reportMetadata = value
          this.isPageLoaded = true
          this.toastComponent.addAlert({type: 'success', message: 'Data loaded!'})
        }, error: () => {
          this.toastComponent.addAlert({type: 'danger', message: 'Could not retrieve data for table'})
        }
      })
  }

  openModal(): void {
    this.tableSettingsModal.open();
  }

  getDate(seconds: string): Date {
    return new Date(parseInt(seconds))
  }

  toggleFilter(): void {
    this.showFilter = !this.showFilter;
  }

  changeFilter(event: any): void {
    this.filterValue = event.target.value;
  }

  changeTableLimit(event: any): void {
    this.displayAmount = event.target.value;
    this.loadData()
  }

  refresh(): void {
    this.showFilter = false;
    this.reportMetadata = {};
    this.isPageLoaded = false;
    this.displayAmount = 10;
    this.loadData();
  }

  openReport(storageId: string): void {
    this.httpService.getReport(storageId).subscribe(data => {
      data.id = this.id;
      this.openReportEvent.next(data)
    })
  }

  openAllReports(): void {
    this.reportMetadata.values.map((report: string[]) => this.openReport(report[this.STORAGE_ID_INDEX]))
  }

  openReports(amount: number) {
    this.reportMetadata.values.slice(0, amount).map((report: string[]) => this.openReport(report[this.STORAGE_ID_INDEX]))
  }

  downloadReports(exportMessages: boolean, exportReports: boolean): void {
    const queryString = this.reportMetadata.values
      .reduce((totalQuery: string, selectedReport: string[]) => totalQuery + "id=" + selectedReport[this.STORAGE_ID_INDEX] + "&", "?")
    window.open('api/report/download/debugStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));
  }

  uploadReport(event: any): void {
    const file: File = event.target.files[0]
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      this.httpService.uploadReport(formData).subscribe(() => {
        this.ngOnInit();
      })
    }
  }

  ngOnDestroy() {
    this.loaderService.saveTableSettings(this.reportMetadata, this.showFilter)
  }
}
