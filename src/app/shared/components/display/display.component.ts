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
    this.loadMonacoCode();
    this.displayReport = true;
    this.rerunResult = '';
    this.disableEditing(); // For switching from editing current report to another
  }

  loadMonacoCode() {
    if (this.report.root) {
      this.httpService.getMonacoCode(this.report.ladybug.storageId).subscribe((data) => {
        this.monacoEditorComponent?.loadMonaco(data.xml);
      });
    } else {
      this.monacoEditorComponent?.loadMonaco(beautify(this.report.ladybug.message));
    }
  }

  closeReport(onlyClosingDisplay: boolean, reportId: number): void {
    if (onlyClosingDisplay) {
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
    if (!this.report.root) {
      checkpointId = this.report.ladybug.uid.split('#')[1];
    }
    this.httpService
      .postReport(this.report.ladybug.storageId, this.getReportValues(checkpointId))
      .subscribe((response: any) => {
        this.saveReportEvent.next(response.report);
      });
  }

  discardChanges() {
    if (!this.report.root) {
      this.monacoEditorComponent.loadMonaco(this.differenceModal[0].originalValue);
    }
  }

  getReportValues(checkpointId: string): any {
    return {
      name: this.name?.nativeElement.value ?? '',
      path: this.path?.nativeElement.value ?? '',
      description: this.description?.nativeElement.value ?? '',
      transformation: this.transformation?.nativeElement.value ?? '',
      checkpointId: checkpointId,
      checkpointMessage: this.monacoEditorComponent?.getValue() ?? '',
    };
  }

  copyReport(): void {
    const storageId: number = +this.report.ladybug.storageId;
    const data: any = { debugStorage: [storageId] };
    this.httpService.copyReport(data).subscribe();
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    const queryString: string = '?id=' + this.report.ladybug.uid.split('#')[0];
    window.open('api/report/download/debugStorage/' + exportBinary + '/' + exportXML + queryString);
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
