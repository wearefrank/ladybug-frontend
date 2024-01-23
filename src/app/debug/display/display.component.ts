import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../shared/services/http.service';
import { DisplayTableComponent } from '../../shared/components/display-table/display-table.component';
import { HelperService } from '../../shared/services/helper.service';
import { CustomEditorComponent } from '../../custom-editor/custom-editor.component';

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
  @ViewChild('editorComponent') editorComponent!: CustomEditorComponent;
  @ViewChild(DisplayTableComponent)
  displayTableComponent!: DisplayTableComponent;
  metadataTableVisible: boolean = false;

  constructor(private httpService: HttpService, private helperService: HelperService) {}

  showReport(report: any): void {
    this.report = report;
    this.displayReport = true;
    report.xml
      ? this.editorComponent.setNewReport(report.xml)
      : this.editorComponent.setNewReport(this.helperService.convertMessage(report));
  }

  closeReport(removeReportFromTree: boolean): void {
    this.displayReport = false;
    if (removeReportFromTree) {
      this.closeReportEvent.emit(this.report);
    }
    this.editorComponent.setNewReport('');
  }

  changeEncoding(button: any): void {
    this.editorComponent.setNewReport(this.helperService.changeEncoding(this.report, button));
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

  toggleMetadataTable() {
    this.metadataTableVisible = !this.metadataTableVisible;
  }

  //TODO: implement when setting stub strategy is added
  onSave(event: any) {}
}
