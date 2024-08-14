import { Component, Input, Output, ViewChild } from '@angular/core';
import { ReportDifference } from '../../shared/interfaces/report-difference';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../shared/services/http.service';
import DiffMatchPatch from 'diff-match-patch';
import { HelperService } from '../../shared/services/helper.service';
import { CustomEditorComponent } from '../../custom-editor/custom-editor.component';
import { Report } from '../../shared/interfaces/report';
import { MetadataTableComponent } from '../../shared/components/metadata-table/metadata-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgClass, NgStyle, TitleCasePipe } from '@angular/common';
import { BooleanToStringPipe } from '../../shared/pipes/boolean-to-string.pipe';
import { Subject } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { ChangesAction, DifferenceModalComponent } from '../difference-modal/difference-modal.component';
import { ToggleButtonComponent } from '../../shared/components/button/toggle-button/toggle-button.component';
import { ToastService } from '../../shared/services/toast.service';
import { TestResult } from '../../shared/interfaces/test-result';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';
import { UpdateReport } from '../../shared/interfaces/update-report';
import { UpdateCheckpoint } from '../../shared/interfaces/update-checkpoint';
import { UpdateReportResponse } from '../../shared/interfaces/update-report-response';
import { View } from '../../shared/interfaces/view';
import { ReportUtil } from '../../shared/util/report-util';
import { EncodingButtonComponent } from './encoding-button/encoding-button.component';
import { Checkpoint } from '../../shared/interfaces/checkpoint';
import { TestReportsService } from '../../test/test-reports.service';
import { DebugTabService } from '../../debug/debug-tab.service';

@Component({
  selector: 'app-edit-display',
  templateUrl: './edit-display.component.html',
  styleUrls: ['./edit-display.component.css'],
  standalone: true,
  imports: [
    ButtonComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    ReactiveFormsModule,
    CustomEditorComponent,
    MetadataTableComponent,
    BooleanToStringPipe,
    NgStyle,
    ClipboardModule,
    EditFormComponent,
    TitleCasePipe,
    DifferenceModalComponent,
    ToggleButtonComponent,
    MatTooltipModule,
    NgClass,
    EncodingButtonComponent,
  ],
})
export class EditDisplayComponent {
  protected readonly ReportUtil = ReportUtil;
  protected readonly Number: NumberConstructor = Number;
  @Input() id: string = '';
  @Input() containerHeight!: number;
  @Input({ required: true }) currentView!: View;
  @Input() newTab: boolean = true;
  @Output() saveReportEvent: Subject<any> = new Subject<any>();
  @Output() closeReportEvent: Subject<void> = new Subject<void>();
  @ViewChild(CustomEditorComponent) editor!: CustomEditorComponent;
  @ViewChild(EditFormComponent) editFormComponent!: EditFormComponent;
  @ViewChild(DifferenceModalComponent) differenceModal!: DifferenceModalComponent;
  editingEnabled: boolean = false;
  editingChildNode: boolean = false;
  editingRootNode: boolean = false;
  metadataTableVisible: boolean = false;
  rerunResult?: TestResult;
  selectedNode?: Report | Checkpoint;
  displayReport: boolean = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private helperService: HelperService,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
    private testReportsService: TestReportsService,
    private debugTab: DebugTabService,
  ) {}

  showReport(node: Report | Checkpoint): void {
    this.disableEditing();
    this.selectedNode = node;
    if (ReportUtil.isReport(this.selectedNode)) {
      this.editor.setNewReport(this.selectedNode.xml);
    } else if (ReportUtil.isCheckPoint(this.selectedNode)) {
      this.editor.setNewReport(this.convertMessage(this.selectedNode));
    }
    this.rerunResult = undefined;
    this.displayReport = true;
  }

  convertMessage(checkpoint: Checkpoint): string {
    let message: string = checkpoint.message;
    if (checkpoint.encoding == 'Base64') {
      message = btoa(message);
    }
    return message;
  }

  rerunReport(): void {
    const node: Report | Checkpoint = this.selectedNode!;
    if (!ReportUtil.isReport(node)) {
      this.toastService.showDanger('Could not find report to rerun');
      return;
    }
    const reportId: number = node.storageId;
    this.httpService.runReport(this.currentView.storageName, reportId).subscribe({
      next: (response: TestResult): void => {
        this.toastService.showSuccess('Report rerun successful');
        this.rerunResult = response;
        this.debugTab.refresh([reportId]);
      },
    });
  }

  closeReport(removeReportFromTree: boolean): void {
    const node: Report | Checkpoint = this.selectedNode!;
    if (!ReportUtil.isReport(node)) {
      this.toastService.showDanger('Could not find report to close');
      return;
    }
    this.displayReport = false;
    this.editingRootNode = false;
    this.editingChildNode = false;
    if (removeReportFromTree) {
      this.closeReportEvent.next();
    }
    this.editor.setNewReport('');
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let queryString: string;
    if (ReportUtil.isReport(node)) {
      queryString = String(node.storageId);
    } else if (ReportUtil.isCheckPoint(node)) {
      queryString = node.uid.split('#')[0];
    } else {
      queryString = '';
    }
    if (!queryString) {
      this.toastService.showDanger('Could not find report to download');
      return;
    }
    this.helperService.download(`${queryString}&`, this.currentView.storageName, exportBinary, exportXML);
    this.httpService.handleSuccess('Report Downloaded!');
  }

  selectStubStrategy(event: Event): void {
    this.saveChanges(Number.parseInt((event.target as HTMLOptionElement).value));
  }

  openDifferenceModal(type: ChangesAction): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let reportDifferences: ReportDifference[] = [];
    if (ReportUtil.isReport(node) && this.editFormComponent) {
      reportDifferences = this.editFormComponent.getDifferences();
    } else if (ReportUtil.isCheckPoint(node)) {
      reportDifferences.push({
        name: 'message',
        originalValue: node.message,
        // @ts-ignore
        difference: new DiffMatchPatch().diff_main(this.report.message ?? '', this.editor?.getValue()),
      });
    }
    if (reportDifferences.length > 0) {
      this.differenceModal.open(reportDifferences, type);
    } else {
      this.rerunReport();
    }
  }

  getReportValues(checkpointId: string): UpdateReport | UpdateCheckpoint {
    return this.editingRootNode ? this.getReportValuesForRootNode() : this.getReportValuesForChildNode(checkpointId);
  }

  getReportValuesForRootNode(): UpdateReport {
    return this.editFormComponent.getValues();
  }

  getReportValuesForChildNode(checkpointId: string): UpdateCheckpoint {
    return {
      checkpointId: checkpointId,
      // checkpointMessage can only be updated when stub is not in request body
      checkpointMessage: this.editor.getValue(),
    };
  }

  editReport(): void {
    const node: Report | Checkpoint = this.selectedNode!;
    if (ReportUtil.isReport(node)) {
      this.editingRootNode = true;
    } else {
      this.editingChildNode = true;
    }
    this.editingEnabled = true;
  }

  disableEditing(): void {
    if (this.editingChildNode) {
      this.editingChildNode = false;
    }
    this.editingRootNode = false;
    this.editingEnabled = false;
  }

  saveChanges(stubStrategy: number): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let checkpointId: string = '';
    let storageId: string;
    if (ReportUtil.isReport(node)) {
      storageId = String(node.storageId);
    } else if (ReportUtil.isCheckPoint(node)) {
      storageId = node.uid.split('#')[0];
      checkpointId = node.uid.split('#')[1];
    } else {
      return;
    }

    const body = this.getReportValues(checkpointId);
    const message: string = ReportUtil.isReport(node) ? node.xml : node.message;

    this.httpService.updateReport(storageId, body, this.currentView.storageName).subscribe({
      next: (response: UpdateReportResponse) => {
        response.report.xml = response.xml;
        this.selectedNode = response.report;
        this.saveReportEvent.next(this.selectedNode);
        this.editor.setNewReport(message);
        this.disableEditing();
        this.debugTab.refresh([+storageId]);
      },
    });
  }

  discardChanges(): void {
    const node: Report | Checkpoint = this.selectedNode!;
    this.disableEditing();
    if (ReportUtil.isCheckPoint(node)) {
      this.editor.setNewReport(node.message);
    }
    this.toastService.showSuccess('Changes discarded!');
  }

  toggleMetadataTable(): void {
    this.metadataTableVisible = !this.metadataTableVisible;
  }

  showEditorPossibilitiesModal(modal: any): void {
    this.modalService.open(modal, {
      backdrop: true,
      backdropClass: 'modal-backdrop',
      modalDialogClass: 'modal-window',
    });
  }

  copyReport(): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let storageId: number;
    storageId = ReportUtil.isReport(node)
      ? node.storageId
      : (node.storageId ?? Number.parseInt(node.uid.split('#')[0]));
    const data: Record<string, number[]> = {
      [this.currentView.storageName]: [storageId!],
    };
    this.httpService.copyReport(data, 'Test').subscribe({
      next: () => this.testReportsService.getReports(),
    }); // TODO: storage is hardcoded, fix issue #196 for this
  }

  toggleEditMode(value: boolean): void {
    if (value) {
      this.editReport();
    } else {
      this.disableEditing();
    }
  }
}
