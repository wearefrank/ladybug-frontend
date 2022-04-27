import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';
// @ts-ignore
import DiffMatchPatch from 'diff-match-patch';
// @ts-ignore
import beautify from 'xml-beautifier';
import { HttpService } from '../../services/http.service';
import { DisplayTableComponent } from '../display-table/display-table.component';
import { DifferenceModal } from '../../interfaces/difference-modal';
import { TreeNode } from '../../interfaces/tree-node';
import { LoaderService } from '../../services/loader.service';

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

  constructor(private modalService: NgbModal, private httpService: HttpService, private loaderService: LoaderService) {}

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
      this.loadMonacoCode();
    }, 100);
    this.displayReport = true;
    this.rerunResult = '';
    this.disableEditing(); // For switching from editing current report to another
  }

  loadMonacoCode() {
    if (this.report.root) {
      this.monacoEditorComponent?.loadMonaco(this.report.ladybug.xml, '');
    } else {
      let message: string = this.report.ladybug.message === null ? '' : this.report.ladybug.message;
      this.monacoEditorComponent?.loadMonaco(beautify(message), '');
    }
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
      this.saveChanges();
    } else {
      this.discardChanges();
    }

    this.disableEditing();
    this.modalService.dismissAll();
  }

  saveChanges() {
    let checkpointId: string = '';
    let storageId: string = '';
    if (!this.report.root) {
      storageId = this.report.ladybug.uid.split('#')[0];
      checkpointId = this.report.ladybug.uid.split('#')[1];
    } else {
      storageId = this.report.ladybug.storageId;
    }

    this.httpService.postReport(storageId, this.getReportValues(checkpointId)).subscribe((response: any) => {
      response.report.xml = response.xml;
      this.saveReportEvent.next(response.report);
      this.notifyTestTabOfSavedReport(storageId, response.report);
    });
  }

  notifyTestTabOfSavedReport(previousStorageId: string, updateReport: any): void {
    let testReports = this.loaderService.getTestReports();
    let reportIndex = testReports.findIndex((report) => report.storageId == previousStorageId);
    testReports[reportIndex] = updateReport;
    this.loaderService.setTestReports(testReports);
  }

  discardChanges() {
    if (!this.report.root) {
      this.monacoEditorComponent.loadMonaco(this.differenceModal[0].originalValue, '');
    }
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
    const data: any = { debugStorage: [storageId] };
    this.httpService.copyReport(data).subscribe();
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    let queryString: string = this.report.root
      ? this.report.ladybug.storageId.toString()
      : this.report.ladybug.uid.split('#')[0];
    window.open('api/report/download/debugStorage/' + exportBinary + '/' + exportXML + '?id=' + queryString);
    this.httpService.handleSuccess('Report Downloaded!');
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
    this.httpService.runDisplayReport(reportId).subscribe((response) => {
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
