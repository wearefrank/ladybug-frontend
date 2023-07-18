import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DifferenceModal } from '../../shared/interfaces/difference-modal';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../shared/services/http.service';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
import { HelperService } from '../../shared/services/helper.service';
import { EditorComponent } from '../../shared/components/editor/editor.component';

@Component({
  selector: 'app-edit-display',
  templateUrl: './edit-display.component.html',
  styleUrls: ['./edit-display.component.css'],
})
export class EditDisplayComponent {
  editingChildNode: boolean = false;
  editingRootNode: boolean = false;
  rerunResult: string = '';
  report: any = {};
  @Input() id: string = '';
  currentView: any = {
    storageName: 'Test',
  };
  @Output() saveReportEvent = new EventEmitter<any>();
  @ViewChild(EditorComponent) editor!: EditorComponent;
  @ViewChild('name') name!: ElementRef;
  @ViewChild('description') description!: ElementRef;
  @ViewChild('path') path!: ElementRef;
  @ViewChild('transformation') transformation!: ElementRef;
  @ViewChild('variables') variables!: ElementRef;
  saveOrDiscardType: string = '';
  differenceModal: DifferenceModal[] = [];

  constructor(private modalService: NgbModal, private httpService: HttpService, private helperService: HelperService) {}

  showReport(report: any): void {
    this.report = report;
    report.xml ? this.editor.setValue(report.xml) : this.editor.setValue(this.helperService.convertMessage(report));
    this.rerunResult = '';
    this.disableEditing(); // For switching from editing current report to another
  }

  changeEncoding(button: any): void {
    this.editor.setValue(this.helperService.changeEncoding(this.report, button));
  }

  rerunReport(): void {
    let reportId: string = this.report.storageId;
    this.httpService.runDisplayReport(reportId, this.currentView.storageName).subscribe((response) => {
      let element = document.querySelector('#showRerunResult')!;
      if (this.report == response) {
        element.setAttribute('style', 'background-color: green');
        this.rerunResult = '[Rerun succeeded]';
      } else {
        element.setAttribute('style', 'background-color: red');
        this.rerunResult = '[Rerun failed]';
      }
    });
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    let queryString: string = this.report.xml ? this.report.storageId.toString() : this.report.uid.split('#')[0];
    this.helperService.download(queryString + '&', this.currentView.storageName, exportBinary, exportXML);
    this.httpService.handleSuccess('Report Downloaded!');
  }

  selectStubStrategy(event: any) {
    let stubStrategy: string;
    switch (event.target.value) {
      case 'Use report level stub strategy':
        stubStrategy = '-1';
        break;
      case 'Always stub this checkpoint':
        stubStrategy = '1';
        break;
      case 'Never stub this checkpoint':
        stubStrategy = '0';
        break;
      default:
        stubStrategy = this.report.stub;
    }
    this.saveChanges(true, stubStrategy);
  }

  openDifferenceModal(modal: any, type: string): void {
    this.differenceModal = [];
    if (this.report.xml) {
      this.addToDifferenceModal('name', this.name.nativeElement.value);
      this.addToDifferenceModal('description', this.description.nativeElement.value);
      this.addToDifferenceModal('path', this.path.nativeElement.value);
      this.addToDifferenceModal('transformation', this.transformation.nativeElement.value);
      this.addToDifferenceModal('variables', this.variables.nativeElement.value);
    } else {
      this.addToDifferenceModal('message', this.editor?.getValue());
    }

    modal.type = type;
    this.saveOrDiscardType = type;
    this.modalService.open(modal, { backdrop: 'static', keyboard: false });
  }

  addToDifferenceModal(keyword: string, elementValue: string) {
    const difference = new DiffMatchPatch().diff_main(this.report[keyword] ?? '', elementValue ?? '');
    this.differenceModal.push({
      name: keyword,
      originalValue: this.report[keyword],
      difference: difference,
    });
  }

  getReportValues(checkpointId: string): any {
    return {
      name: this.name?.nativeElement.value ?? '',
      path: this.path?.nativeElement.value ?? '',
      description: this.description?.nativeElement.value ?? '',
      transformation: this.transformation?.nativeElement.value ?? '',
      checkpointId: checkpointId,
      variables: this.variables?.nativeElement.value ?? '',
      checkpointMessage: this.editor?.getValue() ?? '',
    };
  }

  dismissModal() {
    this.differenceModal = [];
    this.modalService.dismissAll();
  }

  editReport(): void {
    if (this.report.xml) {
      this.editingRootNode = true;
    } else {
      this.editingChildNode = true;
      this.editor.enableEdit();
    }
  }

  disableEditing() {
    if (this.editingChildNode) {
      this.editingChildNode = false;
      this.editor?.disableEdit();
    }
    this.editingRootNode = false;
  }

  saveOrDiscard(type: string): void {
    if (type === 'save') {
      this.saveChanges(false, this.report.stub);
    } else {
      this.discardChanges();
    }

    this.disableEditing();
    this.modalService.dismissAll();
  }

  discardChanges() {
    if (!this.report.xml) {
      this.editor.setValue(this.differenceModal[0].originalValue);
    }
  }

  saveChanges(saveStubStrategy: boolean, stubStrategy: string) {
    let checkpointId: string = '';
    let storageId: string;
    if (!this.report.xml) {
      storageId = this.report.uid.split('#')[0];
      checkpointId = this.report.uid.split('#')[1];
    } else {
      storageId = this.report.storageId;
    }

    const params = saveStubStrategy
      ? { stub: stubStrategy, checkpointId: checkpointId }
      : this.getReportValues(checkpointId);

    this.httpService.updateReport(storageId, params, this.currentView.storageName).subscribe((response: any) => {
      response.report.xml = response.xml;
      this.saveReportEvent.next(response.report);
    });
  }
}
