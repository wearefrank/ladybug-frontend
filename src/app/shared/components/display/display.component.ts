import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
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
  report: TreeNode = {
    id: -1,
    ladybug: undefined,
    level: -1,
    root: false,
    text: '',
  };
  @Output() closeReportEvent = new EventEmitter<any>();
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

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService
  ) {}

  openDifferenceModal(modal: any, type: string): void {
    if (this.report.root) {
      this.addToDifferenceModal('name', this.name.nativeElement.value);
      this.addToDifferenceModal(
        'description',
        this.description.nativeElement.value
      );
      this.addToDifferenceModal('path', this.path.nativeElement.value);
      this.addToDifferenceModal(
        'transformation',
        this.transformation.nativeElement.value
      );
    } else {
      this.addToDifferenceModal(
        'message',
        this.monacoEditorComponent?.getValue()
      );
    }

    modal.type = type;
    this.saveOrDiscardType = type;
    this.modalService.open(modal, { backdrop: 'static', keyboard: false });
  }

  addToDifferenceModal(keyword: string, elementValue: string) {
    const difference = new DiffMatchPatch().diff_main(
      this.report.ladybug[keyword] ?? '',
      elementValue ?? ''
    );
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
    this.disableEditing(); // For switching from editing current report to another
  }

  loadMonacoCode() {
    if (this.report.root) {
      this.httpService
        .getMonacoCode(this.report.ladybug.storageId)
        .subscribe((data) => {
          this.monacoEditorComponent?.loadMonaco(data.xml);
        });
    } else {
      this.monacoEditorComponent?.loadMonaco(
        beautify(this.report.ladybug.message)
      );
    }
  }

  closeReport(): void {
    this.closeReportEvent.next(this.report);
    this.displayReport = false;
    this.report = {
      id: -1,
      ladybug: undefined,
      level: 0,
      root: false,
      text: '',
    };
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
    if (this.report.root) {
      this.httpService
        .postReport(this.report.ladybug.storageId, this.getReportValues())
        .subscribe();
    } else {
      // TODO: Save the changes in the message for child nodes (aka the editor changes)
    }
  }

  discardChanges() {
    if (!this.report.root) {
      this.monacoEditorComponent.loadMonaco(
        this.differenceModal[0].originalValue
      );
    }
  }

  getReportValues(): any {
    return {
      name: this.name.nativeElement.value,
      path: this.path.nativeElement.value,
      description: this.description.nativeElement.value,
      transformation: this.transformation.nativeElement.value,
    };
  }

  copyReport(): void {
    const storageId: number = +this.report.ladybug.storageId;
    const data: any = { debugStorage: [storageId] };
    this.httpService.copyReport(data).subscribe();
  }

  downloadReport(exportMessages: boolean, exportReports: boolean): void {
    const queryString: string = '?id=' + this.report.ladybug.uid.split('#')[0];
    window.open(
      'api/report/download/debugStorage/' +
        exportMessages +
        '/' +
        exportReports +
        queryString
    );
    this.httpService.handleSuccess('Report Downloaded!');
  }

  disableEditing() {
    if (this.editingChildNode) {
      this.editingChildNode = false;
      this.monacoEditorComponent?.disableEdit();
    }
    this.editingRootNode = false;
  }
}
