import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {MonacoEditorComponent} from "../monaco-editor/monaco-editor.component";
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
// @ts-ignore
import beautify from "xml-beautifier";
import {HttpService} from "../../services/http.service";
import {DisplayTableComponent} from "../display-table/display-table.component"; // TODO: Check if there is a nicer way to do this

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent {
  @Input() editing: boolean = false
  @Input() editingRoot: boolean = false;
  @Input() displayReport: boolean = false
  @Input() report: any = {};
  @Output() closeReportEvent = new EventEmitter<any>();
  @ViewChild(MonacoEditorComponent) monacoEditorComponent!: MonacoEditorComponent;
  @ViewChild(DisplayTableComponent) displayTableComponent!: DisplayTableComponent;
  @ViewChild('name') name!: ElementRef;
  @ViewChild('description') description!: ElementRef;
  @ViewChild('path') path!: ElementRef;
  @ViewChild('transformation') transformation!: ElementRef;
  stubStrategies: string[] = ["Follow report strategy", "No", "Yes"];
  saveOrDiscardType: string = '';
  modalThing: any[] = []

  constructor(private modalService: NgbModal, private httpService: HttpService) {
  }

  /**
   * Open a modal
   * @param content - the specific modal to be opened
   * @param type
   */
  openModal(content: any, type: string): void {
    this.saveOrDiscardType = type;
    const dmp = new DiffMatchPatch();

    let ladybug = this.report.ladybug;
    // If it is not the root, find the difference in the code
    if (!this.report.root) {
      let monacoAfter = this.monacoEditorComponent?.getValue();
      let code = dmp.diff_main(ladybug.message, monacoAfter?? '');
      this.modalThing.push({name: "Configuration", ladybug: ladybug.message, difference: code})
    } else {
      // If it is the root, find the difference in meta-data
      let name = dmp.diff_main(ladybug.name?? '', this.name.nativeElement.value?? '');
      this.modalThing.push({name: "Name", ladybug: ladybug.name, difference: name})

      let description = dmp.diff_main(ladybug.description?? '', this.description.nativeElement.value?? '')
      this.modalThing.push({name: "Description", ladybug: ladybug.description, difference: description})

      let path = dmp.diff_main(ladybug.path?? '', this.path.nativeElement.value?? '')
      this.modalThing.push({name: "Path", ladybug: ladybug.path, difference: path})

      let transformation = dmp.diff_main(ladybug.transformation?? '', this.transformation.nativeElement.value?? '')
      this.modalThing.push({name: "Transformation", ladybug: ladybug.transformation, difference: transformation})
    }

    content.type = type;
    this.modalService.open(content, {backdrop: 'static', keyboard: false});
  }

  /**
   * Show a report in the display
   * @param report - the report to be sown
   */
  showReport(report: any): void {
    this.report = report;

    // This is for the root report which has a specific location for the xml message
    if (this.report.ladybug.storageId) {
      this.httpService.getMonacoCode(this.report.ladybug.storageId).subscribe(data => {
        this.report.ladybug.message = data.xml;
        this.monacoEditorComponent?.loadMonaco(beautify(data.xml));
      })
    } else {
      // All other reports have the message stored normally
      this.monacoEditorComponent?.loadMonaco(beautify(this.report.ladybug.message));
    }
    this.displayReport = true;
    this.disableEditing();
  }

  /**
   * Close a report
   */
  closeReport(): void {
    this.closeReportEvent.next(this.report)
    this.displayReport = false;
    this.report = {};
  }

  /**
   * Start editing a report
   */
  editReport(): void {
    this.editing = true;
    if (this.report.root) {
      this.editingRoot = true;
    } else {
      this.toggleMonacoEditor();
    }
  }

  /**
   * Save or discard report changes
   * @param type
   */
  saveOrDiscard(type: string): void {
    this.editing = false;
    this.editingRoot = false;
    this.modalService.dismissAll();
    this.toggleMonacoEditor();
    if (type === "save") {
      this.saveReport()
    }
  }

  /**
   * Save changes of a report.
   */
  saveReport(): void {
    let newReport: any = {
      "name": this.name.nativeElement.value,
      "path": this.path.nativeElement.value,
      "description": this.description.nativeElement.value,
      "transformation": this.transformation.nativeElement.value
    };

    this.httpService.postReport(this.report.ladybug.storageId, newReport).subscribe(report => {
      console.log(report) // The update report
    })
    this.showReport(this.report)
  }

  /**
   * Copy a report to the test tab.
   */
  copyReport(): void {
    let storageId: number = +this.report.ladybug.uid.split("#")[0];
    let data: any = {}
    data['debugStorage'] = [storageId]
    this.httpService.copyReport(data)
  }

  /**
   * Directly download a report
   * @param exportMessages - boolean to see if messages are to be downloaded
   * @param exportReports - boolean to see if reports are to be downloaded
   */
  downloadReport(exportMessages: boolean, exportReports: boolean): void {
    let queryString = "?id=" + this.report.ladybug.uid.split('#')[0];
    window.open('api/report/download/debugStorage/' + exportMessages + "/" + exportReports + queryString);
    this.httpService.handleSuccess('Report Downloaded!')
  }

  /**
   * Toggle editing the monaco editor
   */
  toggleMonacoEditor(): void {
    if (!this.report.root) {
      this.monacoEditorComponent.toggleEdit();
    }
  }

  dismissModal() {
    this.modalService.dismissAll();
    this.disableEditing();
  }

  disableEditing() {
    if (this.editing && !this.editingRoot) {
      this.monacoEditorComponent.toggleEdit();
    }
    this.editing = false;
    this.editingRoot = false;
  }
}
