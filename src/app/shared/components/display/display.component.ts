import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {MonacoEditorComponent} from "../monaco-editor/monaco-editor.component";
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
// @ts-ignore
import beautify from "xml-beautifier";
import {ToastComponent} from "../toast/toast.component";
import {HttpService} from "../../services/http.service";
import {HelperService} from "../../services/helper.service"; // TODO: Check if there is a nicer way to do this

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
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  @ViewChild('name') name!: ElementRef;
  @ViewChild('description') description!: ElementRef;
  @ViewChild('path') path!: ElementRef;
  @ViewChild('transformation') transformation!: ElementRef;
  monacoBefore: string = '';
  difference: { code: [], name: string, description: string, path: string, transformation: string } = {
    code: [],
    name: '',
    description: '',
    path: '',
    transformation: ''
  };
  stubStrategies: string[] = ["Follow report strategy", "No", "Yes"];
  type: string = '';

  constructor(private modalService: NgbModal, private httpService: HttpService, private helperService: HelperService) {
  }

  /**
   * Open a modal
   * @param content - the specific modal to be opened
   * @param type
   */
  openModal(content: any, type: string): void {
    this.type = type;
    const dmp = new DiffMatchPatch();

    // If it is not the root, find the difference in the code
    if (!this.report.root) {
      this.monacoBefore = this.report.ladybug.message;
      let monacoAfter = this.monacoEditorComponent?.getValue();
      this.difference.code = dmp.diff_main(this.monacoBefore, monacoAfter?? '');
    } else {
      // If it is the root, find the difference in meta-data
      let ladybug = this.report.ladybug
      this.difference.name = dmp.diff_main(ladybug.name?? '', this.name.nativeElement.value?? '')
      this.difference.description = dmp.diff_main(ladybug.description?? '', this.description.nativeElement.value?? '')
      this.difference.path = dmp.diff_main(ladybug.path?? '', this.path.nativeElement.value?? '')
      this.difference.transformation = dmp.diff_main(ladybug.transformation?? '', this.transformation.nativeElement.value?? '')
    }
    content.type = type;
    this.modalService.open(content);
  }

  /**
   * Show a report in the display
   * @param report - the report to be sown
   */
  showReport(report: any): void {
    this.report = report;

    // This is for the root report which has a specific location for the xml message
    if (this.report.ladybug.storageId) {
      this.httpService.getMonacoCode(this.report.ladybug.storageId, this.toastComponent).subscribe(data => {
        this.report.ladybug.message = data.xml;
        this.monacoEditorComponent?.loadMonaco(beautify(data.xml));
      })
    } else {
      // All other reports have the message stored normally
      this.monacoEditorComponent?.loadMonaco(beautify(this.report.ladybug.message));
    }
    this.displayReport = true;
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

    this.httpService.postReport(this.report.ladybug.storageId, this.toastComponent, newReport).subscribe(report => {
      this.toastComponent.addAlert({type: 'success', message: 'Report updated!'})
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
    this.httpService.copyReport(data, this.toastComponent).subscribe(() => {
      this.toastComponent.addAlert({type: 'success', message: 'Report copied!'})
    });
  }

  /**
   * Directly download a report
   * @param exportMessages - boolean to see if messages are to be downloaded
   * @param exportReports - boolean to see if reports are to be downloaded
   */
  downloadReport(exportMessages: boolean, exportReports: boolean): void {
    let queryString = "?id=" + this.report.ladybug.uid.split('#')[0];
    window.open('api/report/download/debugStorage/' + exportMessages + "/" + exportReports + queryString);
    this.toastComponent.addAlert({type: 'success', message: 'Report Downloaded!'})
  }

  /**
   * Toggle editing the monaco editor
   */
  toggleMonacoEditor(): void {
    if (!this.report.root) {
      this.monacoEditorComponent.toggleEdit();
    }
  }
}
