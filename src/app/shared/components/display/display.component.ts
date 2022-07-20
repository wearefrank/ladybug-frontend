import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
import { HttpService } from '../../services/http.service';
import { DisplayTableComponent } from '../display-table/display-table.component';
import { DifferenceModal } from '../../interfaces/difference-modal';
import { TreeNode } from '../../interfaces/tree-node';
declare var require: any;
const { Buffer } = require('buffer');

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css'],
})
export class DisplayComponent {
  editingChildNode: boolean = false;
  editingRootNode: boolean = false;
  displayReport: boolean = false;
  rerunResult: string = '';
  report: TreeNode = {
    id: -1,
    ladybug: undefined,
    level: -1,
    root: false,
    text: '',
  };
  @Input() id: string = '';
  @Input() currentView: any = {};
  @Output() closeReportEvent = new EventEmitter<any>();
  @Output() saveReportEvent = new EventEmitter<any>();
  @ViewChild(MonacoEditorComponent)
  monacoEditorComponent!: MonacoEditorComponent;
  @ViewChild(DisplayTableComponent)
  displayTableComponent!: DisplayTableComponent;
  @ViewChild('name') name!: ElementRef;
  @ViewChild('description') description!: ElementRef;
  @ViewChild('path') path!: ElementRef;
  @ViewChild('transformation') transformation!: ElementRef;
  @ViewChild('variables') variables!: ElementRef;
  stubStrategies: string[] = ['Follow report strategy', 'No', 'Yes'];
  saveOrDiscardType: string = '';
  differenceModal: DifferenceModal[] = [];

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  openDifferenceModal(modal: any, type: string): void {
    if (this.report.root) {
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
    const difference = new DiffMatchPatch().diff_main(this.report.ladybug[keyword] ?? '', elementValue ?? '');
    this.differenceModal.push({
      name: keyword,
      originalValue: this.report.ladybug[keyword],
      difference: difference,
    });
  }

  showReport(report: TreeNode): void {
    this.report = report;
    setTimeout(() => {
      if (this.report.root) {
        this.loadMonacoCode(this.report.ladybug.xml);
      } else {
        let message: string = this.report.ladybug.message === null ? '' : this.report.ladybug.message;
        if (this.report.ladybug.encoding == 'Base64') {
          this.report.ladybug.showConverted = true;
          message = this.convertMessage(message, 'base64', 'utf8');
        }
        this.loadMonacoCode(message);
      }
    }, 0);
    this.displayReport = true;
    this.rerunResult = '';
    this.disableEditing(); // For switching from editing current report to another
  }

  loadMonacoCode(message: string) {
    this.monacoEditorComponent?.loadMonaco(message);
  }

  closeReport(displayCloseButton: boolean, reportId: number): void {
    if (displayCloseButton) {
      this.closeReportEvent.next(this.report);
      if (this.report.id === reportId) {
        this.displayReport = false;
      }
    } else {
      this.displayReport = false;
    }
  }

  editReport(): void {
    if (this.report.root) {
      this.editingRootNode = true;
    } else {
      this.editingChildNode = true;
      this.monacoEditorComponent.enableEdit();
    }
  }

  // We are neither saving or discarding, so we are still editing
  dismissModal() {
    this.differenceModal = [];
    this.modalService.dismissAll();
  }

  saveOrDiscard(type: string): void {
    if (type === 'save') {
      this.saveChanges(false, this.report.ladybug.stub);
    } else {
      this.discardChanges();
    }

    this.disableEditing();
    this.modalService.dismissAll();
  }

  saveChanges(saveStubStrategy: boolean, stubStrategy: string) {
    let checkpointId: string = '';
    let storageId: string = '';
    if (!this.report.root) {
      storageId = this.report.ladybug.uid.split('#')[0];
      checkpointId = this.report.ladybug.uid.split('#')[1];
    } else {
      storageId = this.report.ladybug.storageId;
    }

    const params = saveStubStrategy
      ? { stub: stubStrategy, checkpointId: checkpointId }
      : this.getReportValues(checkpointId);

    this.httpService.postReport(storageId, this.getReportValues(checkpointId), 'Test').subscribe((response: any) => {
      // TODO: storage is hardcoded for now
      response.report.xml = response.xml;
      this.saveReportEvent.next(response.report);
    });
  }

  discardChanges() {
    if (!this.report.root) {
      this.monacoEditorComponent.loadMonaco(this.differenceModal[0].originalValue);
    }
  }
  convertMessage(message: string, from: string, to: string) {
    return Buffer.from(message, from).toString(to);
  }

  changeEncoding(button: any) {
    let message: string = '';
    if (button.target.innerHTML.includes('Base64')) {
      message = this.report.ladybug.message;
      this.report.ladybug.showConverted = false;

      button.target.title = 'Convert to UTF-8';
      button.target.innerHTML = 'UTF-8';
    } else {
      message = this.convertMessage(this.report.ladybug.message, 'base64', 'utf8');
      this.report.ladybug.showConverted = true;

      button.target.title = 'Convert to Base64';
      button.target.innerHTML = 'Base64';
    }
    this.loadMonacoCode(message);
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

  copyReport(): void {
    const storageId: number = this.report.root
      ? +this.report.ladybug.storageId
      : +this.report.ladybug.uid.split('#')[0];
    const data: any = {};
    data[this.currentView.storageName] = [storageId];
    this.httpService.copyReport(data, 'Test').subscribe(); // TODO: storage is hardcoded, fix issue #196 for this
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    let queryString: string = this.report.root
      ? this.report.ladybug.storageId.toString()
      : this.report.ladybug.uid.split('#')[0];
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
        stubStrategy = this.report.ladybug.stub;
    }
    this.saveChanges(true, stubStrategy);
  }

  disableEditing() {
    if (this.editingChildNode) {
      this.editingChildNode = false;
      this.monacoEditorComponent?.disableEdit();
    }
    this.editingRootNode = false;
  }

  rerunReport() {
    let reportId: string = this.report.ladybug.storageId;
    this.httpService.runDisplayReport(reportId, this.currentView.storageName).subscribe((response) => {
      let element = document.querySelector('#showRerunResult')!;
      if (this.report.ladybug == response) {
        element.setAttribute('style', 'background-color: green');
        this.rerunResult = '[Rerun succeeded]';
      } else {
        element.setAttribute('style', 'background-color: red');
        this.rerunResult = '[Rerun failed]';
      }
    });
  }
}
