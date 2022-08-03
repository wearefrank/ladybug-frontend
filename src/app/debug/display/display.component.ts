import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorComponent } from '../../shared/components/monaco-editor/monaco-editor.component';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
import { HttpService } from '../../shared/services/http.service';
import { DisplayTableComponent } from '../../shared/components/display-table/display-table.component';
import { HelperService } from '../../shared/services/helper.service';

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
      report.xml ? this.loadMonacoCode(report.xml) : this.loadMonacoCode(this.helperService.convertMessage(report));
    });
    this.displayReport = true;
  }

  loadMonacoCode(message: string): void {
    this.monacoEditorComponent?.loadMonaco(message);
  }

  closeReport(removeReportFromTree: boolean): void {
    this.displayReport = false;
    if (removeReportFromTree) {
      this.closeReportEvent.emit(this.report);
    }
  }

  changeEncoding(button: any): void {
    this.loadMonacoCode(this.helperService.changeEncoding(this.report, button));
  }

  copyReport(): void {
    const storageId: number = this.report.xml ? +this.report.storageId : +this.report.uid.split('#')[0];
    const data: any = {};
    data[this.currentView.storageName] = [storageId];
    this.httpService.copyReport(data, 'Test').subscribe(); // TODO: storage is hardcoded, fix issue #196 for this
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    let queryString: string = this.report.xml ? this.report.storageId.toString() : this.report.uid.split('#')[0];
    this.helperService.download('id=' + queryString + '&', this.currentView.storageName, exportBinary, exportXML);
    this.httpService.handleSuccess('Report Downloaded!');
  }
}
