import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorComponent } from '../../shared/components/monaco-editor/monaco-editor.component';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
import { HttpService } from '../../shared/services/http.service';
import { DisplayTableComponent } from '../../shared/components/display-table/display-table.component';
import { HelperService } from '../../shared/services/helper.service';
declare var require: any;
const { Buffer } = require('buffer');

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
})
export class DisplayComponent {
  displayReport: boolean = false;
  report: any = {};
  @Input() currentView: any = {};
  @Output() closeReportEvent = new EventEmitter<any>();
  @ViewChild(MonacoEditorComponent)
  monacoEditorComponent!: MonacoEditorComponent;
  @ViewChild(DisplayTableComponent)
  displayTableComponent!: DisplayTableComponent;

  constructor(private modalService: NgbModal, private httpService: HttpService, private helperService: HelperService) {}

  showReport(report: any): void {
    setTimeout(() => {
      this.report = report;
      if (this.report.xml) {
        this.loadMonacoCode(this.report.xml);
      } else {
        let message: string = this.report.message === null ? '' : this.report.message;
        if (this.report.encoding == 'Base64') {
          this.report.showConverted = true;
          message = this.convertMessage(message, 'base64', 'utf8');
        }
        this.loadMonacoCode(message);
      }
    });
    this.displayReport = true;
  }

  loadMonacoCode(message: string) {
    this.monacoEditorComponent?.loadMonaco(message);
  }

  closeReport(removeReportFromTree: boolean): void {
    this.displayReport = false;
    if (removeReportFromTree) {
      this.closeReportEvent.emit(this.report);
    }
  }

  convertMessage(message: string, from: string, to: string) {
    return Buffer.from(message, from).toString(to);
  }

  changeEncoding(button: any) {
    let message: string = '';
    if (button.target.innerHTML.includes('Base64')) {
      message = this.report.message;
      this.report.showConverted = false;

      button.target.title = 'Convert to UTF-8';
      button.target.innerHTML = 'UTF-8';
    } else {
      message = this.convertMessage(this.report.message, 'base64', 'utf8');
      this.report.showConverted = true;

      button.target.title = 'Convert to Base64';
      button.target.innerHTML = 'Base64';
    }
    this.loadMonacoCode(message);
  }

  copyReport(): void {
    const storageId: number = this.report.xml ? +this.report.storageId : +this.report.uid.split('#')[0];
    const data: any = {};
    data[this.currentView.storageName] = [storageId];
    this.httpService.copyReport(data, 'Test').subscribe(); // TODO: storage is hardcoded, fix issue #196 for this
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    let queryString: string = this.report.xml ? this.report.storageId.toString() : this.report.uid.split('#')[0];
    this.helperService.download(queryString + '&', this.currentView.storageName, exportBinary, exportXML);
    this.httpService.handleSuccess('Report Downloaded!');
  }
}
