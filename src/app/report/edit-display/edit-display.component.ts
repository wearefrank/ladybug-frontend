import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DifferenceModal } from '../../shared/interfaces/difference-modal';
import { MonacoEditorComponent } from '../../shared/components/monaco-editor/monaco-editor.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../shared/services/http.service';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
declare var require: any;
const { Buffer } = require('buffer');

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
  @Input() currentView: any = {};
  @Output() saveReportEvent = new EventEmitter<any>();
  @ViewChild(MonacoEditorComponent) monacoEditorComponent!: MonacoEditorComponent;
  @ViewChild('name') name!: ElementRef;
  @ViewChild('description') description!: ElementRef;
  @ViewChild('path') path!: ElementRef;
  @ViewChild('transformation') transformation!: ElementRef;
  @ViewChild('variables') variables!: ElementRef;
  saveOrDiscardType: string = '';
  differenceModal: DifferenceModal[] = [];

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  showReport(report: any, root: boolean): void {
    this.report = report;
    if (root) {
      this.loadMonacoCode(this.report.xml);
    } else {
      let message: string = this.report.message === null ? '' : this.report.message;
      if (this.report.encoding == 'Base64') {
        this.report.showConverted = true;
        message = this.convertMessage(message, 'base64', 'utf8');
      }
      this.loadMonacoCode(message);
    }
    this.rerunResult = '';
    this.disableEditing(); // For switching from editing current report to another
  }

  loadMonacoCode(message: string) {
    this.monacoEditorComponent?.loadMonaco(message);
  }

  changeEncoding(button: any) {
    let message: string;
    if (button.target.innerHTML.includes('Base64')) {
      message = this.report.message;
      this.setButtonHtml(button, 'UTF-8', false);
    } else {
      message = this.convertMessage(this.report.message, 'base64', 'utf8');
      this.setButtonHtml(button, 'Base64', true);
    }
    this.loadMonacoCode(message);
  }

  setButtonHtml(button: any, type: string, showConverted: boolean) {
    this.report.showConverted = showConverted;
    button.target.title = 'Convert to ' + type;
    button.target.innerHTML = type;
  }

  convertMessage(message: string, from: string, to: string) {
    return Buffer.from(message, from).toString(to);
  }

  rerunReport() {
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
    let queryString: string = this.report.root ? this.report.storageId.toString() : this.report.uid.split('#')[0];
    window.open(
      'api/report/download/' +
        this.currentView.storageName +
        '/' +
        exportBinary +
        '/' +
        exportXML +
        '?id=' +
        queryString
    );
    this.httpService.handleSuccess('Report Downloaded!');
  }

  selectStubStrategy(event: any) {
    let stubStrategy: string;
    switch (event.target.value) {
      case 'Follow report strategy':
        stubStrategy = '-1';
        break;
      case 'No':
        stubStrategy = '0';
        break;
      case 'Yes':
        stubStrategy = '1';
        break;
      default:
        stubStrategy = this.report.stub;
    }
    this.saveChanges(true, stubStrategy);
  }

  openDifferenceModal(modal: any, type: string): void {
    if (this.report.xml) {
      this.addToDifferenceModal('name', this.name.nativeElement.value);
      this.addToDifferenceModal('description', this.description.nativeElement.value);
      this.addToDifferenceModal('path', this.path.nativeElement.value);
      this.addToDifferenceModal('transformation', this.transformation.nativeElement.value);
      this.addToDifferenceModal('variables', this.variables.nativeElement.value);
    } else {
      this.addToDifferenceModal('message', this.monacoEditorComponent?.getValue());
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
      checkpointMessage: this.monacoEditorComponent?.getValue() ?? '',
    };
  }

  dismissModal() {
    this.differenceModal = [];
    this.modalService.dismissAll();
  }

  editReport(): void {
    if (this.report.root) {
      this.editingRootNode = true;
    } else {
      this.editingChildNode = true;
      this.monacoEditorComponent.enableEdit();
    }
  }

  disableEditing() {
    if (this.editingChildNode) {
      this.editingChildNode = false;
      this.monacoEditorComponent?.disableEdit();
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
    if (!this.report.root) {
      this.monacoEditorComponent.loadMonaco(this.differenceModal[0].originalValue);
    }
  }

  saveChanges(saveStubStrategy: boolean, stubStrategy: string) {
    let checkpointId: string = '';
    let storageId: string = '';
    if (!this.report.root) {
      storageId = this.report.uid.split('#')[0];
      checkpointId = this.report.uid.split('#')[1];
    } else {
      storageId = this.report.storageId;
    }

    const params = saveStubStrategy
      ? { stub: stubStrategy, checkpointId: checkpointId }
      : this.getReportValues(checkpointId);

    this.httpService.postReport(storageId, params, 'Test').subscribe((response: any) => {
      // TODO: storage is hardcoded for now
      response.report.xml = response.xml;
      this.saveReportEvent.next(response.report);
    });
  }
}
