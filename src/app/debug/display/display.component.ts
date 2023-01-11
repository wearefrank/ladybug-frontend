import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
import { HttpService } from '../../shared/services/http.service';
import { DisplayTableComponent } from '../../shared/components/display-table/display-table.component';
import { HelperService } from '../../shared/services/helper.service';
import { EditorComponent } from '../../shared/components/editor/editor.component';

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
  @ViewChild(EditorComponent) editor!: EditorComponent;
  @ViewChild(DisplayTableComponent)
  displayTableComponent!: DisplayTableComponent;

  constructor(private modalService: NgbModal, private httpService: HttpService, private helperService: HelperService) {}

  showReport(report: any): void {
    this.report = report;
    report.xml ? this.editor.setValue(report.xml) : this.editor.setValue(this.helperService.convertMessage(report));
    this.displayReport = true;
  }

  closeReport(removeReportFromTree: boolean): void {
    this.displayReport = false;
    if (removeReportFromTree) {
      this.closeReportEvent.emit(this.report);
    }
  }

  changeEncoding(button: any): void {
    this.editor.setValue(this.helperService.changeEncoding(this.report, button));
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
