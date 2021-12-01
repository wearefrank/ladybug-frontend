import {Component, OnInit, Output, EventEmitter, Input, ViewChild, AfterViewInit} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ToastComponent} from "../toast/toast.component";
import {FormControl, FormGroup} from "@angular/forms";
import {HelperService} from "../../services/helper.service";
import {HttpService} from "../../services/http.service";

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {
  @Output() emitEvent = new EventEmitter<any>();
  showFilter: boolean = false;
  metadata: any = {}; // The data that is displayed
  isLoaded: boolean = false; // Wait for the page to be loaded
  displayAmount: number = 400; // The amount of data that is displayed
  filterValue: string = ""; // Value on what table should filter
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  settingsForm = new FormGroup({
    generatorEnabled: new FormControl(''),
    regexFilter: new FormControl(''), // Report filter
    transformationEnabled: new FormControl(false),
    transformation: new FormControl('')
  })

  @Input() // Needed to make a distinction between the two halves in compare component
  get id() {
    return this._id
  }

  set id(id: string) {
    this._id = id
  }

  private _id: string = "";

  constructor(private modalService: NgbModal, private httpService: HttpService, public helperService: HelperService) {
  }

  /**
   * Open a modal
   * @param content - the specific modal to be opened
   */
  openModal(content: any) {
    this.modalService.open(content);
  }

  /**
   * Transform milliseconds to an actual date and time
   * @param seconds - milliseconds since 1-1-1970
   */
  getDate(seconds: string) {
    const date = new Date(parseInt(seconds))
    return ('0' + date.getDay()).slice(-2) + "/" +
      ('0' + date.getUTCMonth()).slice(-2) + "/" +
      date.getFullYear() + " - " +
      ('0' + date.getHours()).slice(-2) + ":" +
      ('0' + date.getMinutes()).slice(-2) + ":" +
      ('0' + date.getSeconds()).slice(-2) + "." +
      ('0' + date.getMilliseconds()).slice(-3)
  }

  /**
   * Change the value on what the table should filter
   * @param event - the keyword
   */
  changeFilter(event: any) {
    this.filterValue = event.target.value;
  }

  /**
   * Change the limit of items shown in table
   * @param event - the new table limit
   */
  changeTableLimit(event: any) {
    this.displayAmount = event.target.value;
    this.ngOnInit()
  }

  /**
   * Refresh the table
   */
  refresh() {
    this.showFilter = false;
    this.metadata = {};
    this.isLoaded = false;
    this.displayAmount = 10;
    this.ngOnInit();
  }

  /**
   * Toggle the filter option
   */
  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  /**
   Request the data based on storageId and send this data along to the tree (via parent)
   */
  openReport(storageId: string) {
    this.httpService.getReport(storageId, this.toastComponent).subscribe(data => {
      data.id = this.id;
      this.emitEvent.next(data)
    })
  }

  /**
   * Open all reports
   */
  openReports(amount: number) {
    if (amount === -1) {
      amount = this.metadata.values.length;
    }

    // The index 5 is the storageId
    for (const row of this.metadata.values.slice(0, amount)) {
      this.openReport(row[5]);
    }
  }

  /**
   * Download reports
   * @param exportMessages - boolean whether messages should be downloaded
   * @param exportReports - boolean whether reports should be downloaded
   */
  downloadReports(exportMessages: boolean, exportReports: boolean) {
    const selectedReports = this.metadata.values;
    const queryString = selectedReports
      .reduce((totalQuery: string, selectedReport: string[]) => totalQuery + "id=" + selectedReport[5] + "&", "?")
    window.open('api/report/download/debugStorage/' + exportMessages + "/" + exportReports + queryString.slice(0, -1));
    this.toastComponent.addAlert({type: 'success', message: 'Reports downloaded!'})
  }

  /**
   * Upload report
   * @param event - click event of the report
   */
  uploadReport(event: any) {
    const file: File = event.target.files[0]
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      this.httpService.uploadReport(formData, this.toastComponent).subscribe(response => {
        this.toastComponent.addAlert({type: 'success', message: 'Report uploaded!'})
        this.loadData();
      })
    }
  }

  /**
   * Save the settings of the table
   */
  saveSettings() {
    const form = this.settingsForm.value;
    let map: any = {generatorEnabled: form.generatorEnabled, regexFilter: form.regexFilter}
    this.httpService.postSettings(map, this.toastComponent);

    if (form.transformationEnabled) {
      let transformation = {transformation: form.transformation}
      this.httpService.postTransformation(transformation, this.toastComponent);
    }
  }

  /**
   * Load in data for the table
   */
  ngOnInit() {
    this.loadData()
    // Also load in the default transformation
    this.httpService.getTransformation(this.toastComponent).subscribe(response => {
      this.settingsForm.get('transformation')?.setValue(response.transformation)
    })
  }

  /**
   * Load in data in table
   */
  loadData() {
    this.httpService.getReports(this.displayAmount).subscribe({
      next: value => {
        this.toastComponent.addAlert({type: 'success', message: 'Data loaded!'})
        this.metadata = value
        this.isLoaded = true
      }, error: () => {
        this.toastComponent.addAlert({type: 'danger', message: 'Could not retrieve data for table'})
      }
    })
  }
}
