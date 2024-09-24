import { Component, Input, ViewChild } from '@angular/core';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgClass, NgStyle, TitleCasePipe } from '@angular/common';
import { BooleanToStringPipe } from '../../shared/pipes/boolean-to-string.pipe';
import { catchError } from 'rxjs';
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
import { StubStrategy } from '../../shared/enums/stub-strategy';
import { ReportAlertMessageComponent } from '../report-alert-message/report-alert-message.component';

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
    FormsModule,
    ReportAlertMessageComponent,
  ],
})
export class EditDisplayComponent {
  protected readonly ReportUtil = ReportUtil;
  protected readonly Number: NumberConstructor = Number;
  protected readonly StubStrategy = StubStrategy;

  @Input() containerHeight!: number;
  @Input({ required: true }) currentView!: View;
  @Input() newTab: boolean = true;
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
  stub?: number;
  stubStrategy?: string;

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
    this.stub = node.stub;
    if (ReportUtil.isReport(this.selectedNode)) {
      this.stubStrategy = this.selectedNode.stubStrategy;
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
    this.httpService
      .runReport(this.currentView.storageName, reportId)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (response: TestResult): void => {
          this.toastService.showSuccess('Report rerun successful');
          this.rerunResult = response;
          this.debugTab.refreshTable();
        },
      });
  }

  closeReport(): void {
    this.displayReport = false;
    this.editingRootNode = false;
    this.editingChildNode = false;
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
    this.toastService.showSuccess('Report Downloaded!');
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
        difference: new DiffMatchPatch().diff_main(node.message ?? '', this.editor?.getValue()),
      });
    }
    if (reportDifferences.length > 0) {
      this.differenceModal.open(reportDifferences, type);
    } else {
      this.rerunReport();
    }
  }

  getReportValues(checkpointId?: string): UpdateReport | UpdateCheckpoint {
    return checkpointId ? this.getReportValuesForChildNode(checkpointId) : this.getReportValuesForRootNode();
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

  updateReportStubStrategy(strategy: string): void {
    if (ReportUtil.isReport(this.selectedNode) && this.selectedNode.stubStrategy !== strategy) {
      this.openStubDifferenceModal(this.selectedNode.stubStrategy, strategy);
    }
  }

  updateCheckpointStubStrategy(strategy: number): void {
    if (this.selectedNode && this.selectedNode.stub !== strategy) {
      this.openStubDifferenceModal(
        StubStrategy.checkpoints[this.selectedNode.stub + 1],
        StubStrategy.checkpoints[strategy + 1],
      );
    }
  }

  openStubDifferenceModal(originalValue: string, difference: string): void {
    if (this.editingEnabled) {
      this.toastService.showWarning('Save or discard your changes before updating the stub strategy');
    } else {
      const reportDifferences: ReportDifference[] = [];
      reportDifferences.push({
        name: 'message',
        originalValue: originalValue,
        difference: difference,
      });
      this.differenceModal.open(reportDifferences, 'save', true);
    }
  }

  saveChanges(stubChange: boolean): void {
    if (this.selectedNode) {
      const node: Report | Checkpoint = this.selectedNode;
      let checkpointId: string | undefined;
      let storageId: string;
      if (ReportUtil.isReport(node)) {
        storageId = String(node.storageId);
      } else if (ReportUtil.isCheckPoint(node)) {
        [storageId, checkpointId] = node.uid.split('#');
      } else {
        return;
      }
      let body;
      if (stubChange) {
        body = checkpointId ? { stub: this.stub, checkpointId: checkpointId } : { stubStrategy: this.stubStrategy };
      } else {
        body = this.getReportValues(checkpointId);
      }
      this.updateReport(storageId, body, node);
    } else {
      this.toastService.showWarning('Please select a node in the debug tree');
    }
  }

  updateReport(storageId: string, body: UpdateReport | UpdateCheckpoint, node: Report | Checkpoint): void {
    this.httpService
      .updateReport(storageId, body, this.currentView.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (response: UpdateReportResponse) => {
          response.report.xml = response.xml;
          if (ReportUtil.isCheckPoint(node)) {
            this.selectedNode = ReportUtil.getCheckpointFromReport(response.report, node.uid);
          } else if (ReportUtil.isReport(node)) {
            this.selectedNode = response.report;
          }
          this.disableEditing();
          this.debugTab.refreshAll([+storageId]);
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
    this.httpService
      .copyReport(data, 'Test')
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
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
