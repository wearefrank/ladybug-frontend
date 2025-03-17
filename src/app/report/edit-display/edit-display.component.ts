/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
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
import { EditorComponent } from '../../editor/editor.component';
import { Report } from '../../shared/interfaces/report';
import { MetadataTableComponent } from '../../shared/components/metadata-table/metadata-table.component';
import { MessagecontextTableComponent } from '../../shared/components/messagecontext-table/messagecontext-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BooleanToStringPipe } from '../../shared/pipes/boolean-to-string.pipe';
import { catchError } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { EditFormComponent } from '../edit-form/edit-form.component';
import {
  ChangesAction,
  DifferenceModalComponent,
} from '../difference-modal/difference-modal.component';
import { ToggleButtonComponent } from '../../shared/components/toggle-button/toggle-button.component';
import { ToastService } from '../../shared/services/toast.service';
import { AppVariablesService } from '../../shared/services/app.variables.service';
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
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-display',
  templateUrl: './edit-display.component.html',
  styleUrls: ['./edit-display.component.css'],
  standalone: true,
  imports: [
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgbDropdownButtonItem,
    NgbDropdownItem,
    ReactiveFormsModule,
    EditorComponent,
    MetadataTableComponent,
    MessagecontextTableComponent,
    BooleanToStringPipe,
    ClipboardModule,
    EditFormComponent,
    DifferenceModalComponent,
    ToggleButtonComponent,
    MatTooltipModule,
    EncodingButtonComponent,
    FormsModule,
    ReportAlertMessageComponent,
  ],
})
export class EditDisplayComponent implements OnChanges {
  @Input() containerHeight!: number;
  @Input({ required: true }) currentView!: View;
  @Input() newTab: boolean = true;
  @ViewChild(EditorComponent) editor!: EditorComponent;
  @ViewChild(EditFormComponent) editFormComponent!: EditFormComponent;
  @ViewChild(DifferenceModalComponent)
  differenceModal!: DifferenceModalComponent;
  @ViewChild('topComponent') topComponent?: ElementRef;
  @ViewChild('editToggleButton') editToggleButton!: ToggleButtonComponent;

  editingEnabled: boolean = false;
  editingChildNode: boolean = false;
  editingRootNode: boolean = false;
  metadataTableVisible: boolean = false;
  messageContextTableVisible: boolean = false;
  displayReport: boolean = false;
  rerunResult?: TestResult;
  selectedNode?: Report | Checkpoint;
  stub?: number;
  stubStrategy?: string;

  protected readonly ReportUtil = ReportUtil;
  protected readonly Number: NumberConstructor = Number;
  protected readonly StubStrategy = StubStrategy;
  protected calculatedHeight: number = 340;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private helperService: HelperService,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
    private testReportsService: TestReportsService,
    private debugTab: DebugTabService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    protected appVariablesService: AppVariablesService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['containerHeight']) {
      const topComponentHeight = this.topComponent
        ? this.topComponent?.nativeElement.offsetHeight
        : 47;
      this.calculatedHeight = this.containerHeight - topComponentHeight;
      this.cdr.detectChanges();
    }
  }

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
    let reportId: number | undefined;
    if (ReportUtil.isReport(node)) {
      reportId = node.storageId;
    } else if (ReportUtil.isCheckPoint(node)) {
      reportId = ReportUtil.getStorageIdFromUid(node.uid);
    }
    if (reportId == undefined) {
      this.toastService.showDanger('Could not find report to rerun');
    } else {
      this.httpService
        .runReport(this.currentView.storageName, reportId)
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: (response: TestResult): void => {
            this.toastService.showSuccess('Report rerun successful');
            this.rerunResult = response;
            this.debugTab.refreshTable({ displayToast: false });
          },
        });
    }
  }

  closeReport(): void {
    this.displayReport = false;
    this.editingRootNode = false;
    this.editingChildNode = false;
    this.editor.setNewReport('');
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let queryString: string = 'id=';
    if (ReportUtil.isReport(node)) {
      queryString += String(node.storageId);
    } else if (ReportUtil.isCheckPoint(node)) {
      queryString += node.uid.split('#')[0];
    } else {
      queryString = '';
    }
    if (!queryString) {
      this.toastService.showDanger('Could not find report to download');
      return;
    }
    this.helperService.download(
      `${queryString}&`,
      this.currentView.storageName,
      exportBinary,
      exportXML,
    );
    this.toastService.showSuccess('Report Downloaded!');
  }

  openDifferenceModal(type: ChangesAction): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let reportDifferences: ReportDifference[] = [];
    if (ReportUtil.isReport(node) && this.editFormComponent) {
      reportDifferences = this.editFormComponent.getDifferences();
    } else if (
      ReportUtil.isCheckPoint(node) &&
      this.editor?.getValue() !== node.message
    ) {
      const diff = new DiffMatchPatch().diff_main(
        node.message ?? '',
        this.editor?.getValue(),
      );
      reportDifferences.push({
        name: 'message',
        originalValue: node.message,
        difference: diff,
      });
    }
    if (reportDifferences.length > 0) {
      this.differenceModal.open(reportDifferences, type);
    } else {
      this.rerunReport();
    }
  }

  getReportValues(checkpointId?: string): UpdateReport | UpdateCheckpoint {
    return checkpointId
      ? this.getReportValuesForChildNode(checkpointId)
      : this.getReportValuesForRootNode();
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
    if (
      ReportUtil.isReport(this.selectedNode) &&
      this.selectedNode.stubStrategy !== strategy
    ) {
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
      this.toastService.showWarning(
        'Save or discard your changes before updating the stub strategy',
      );
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
        body = checkpointId
          ? { stub: this.stub, checkpointId: checkpointId }
          : { stubStrategy: this.stubStrategy };
      } else {
        body = this.getReportValues(checkpointId);
      }
      this.updateReport(storageId, body, node);
    } else {
      this.toastService.showWarning('Please select a node in the debug tree');
    }
  }

  updateReport(
    storageId: string,
    body: UpdateReport | UpdateCheckpoint,
    node: Report | Checkpoint,
  ): void {
    this.httpService
      .updateReport(storageId, body, this.currentView.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (response: UpdateReportResponse) => {
          response.report.xml = response.xml;
          if (ReportUtil.isCheckPoint(node)) {
            this.selectedNode = ReportUtil.getCheckpointFromReport(
              response.report,
              node.uid,
            );
          } else if (ReportUtil.isReport(node)) {
            this.selectedNode = response.report;
          }
          this.disableEditing();
          this.debugTab.refreshAll({
            reportIds: [+storageId],
            displayToast: false,
          });
          this.toastService.showSuccess('Report updated successfully.');
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

  toggleMessageContextTable(): void {
    this.messageContextTableVisible = !this.messageContextTableVisible;
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
        next: () => {
          this.testReportsService.getReports();
          this.toastService.showSuccess('Copied report to testtab', {
            buttonText: 'Go to test tab',
            callback: () => this.router.navigate(['/test']),
          });
        },
      }); // TODO: storage is hardcoded, fix issue #196 for this
  }

  toggleEditMode(value: boolean): void {
    if (this.selectedNode && ReportUtil.isFromCrudStorage(this.selectedNode)) {
      this.changeEditMode(value);
    } else {
      this.showNotEditableWarning();
    }
  }

  showNotEditableWarning(): void {
    this.toastService.showWarning(
      'This storage is readonly, copy to the test tab to edit this report.',
      {
        buttonText: 'Copy to testtab',
        callback: () => {
          this.copyReport();
        },
      },
    );
    setTimeout(() => {
      this.editToggleButton.value = false;
    });
  }

  changeEditMode(value: boolean): void {
    if (value) {
      this.editReport();
    } else {
      this.disableEditing();
    }
  }

  processCustomReportAction(): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let reportId: number | undefined;
    if (ReportUtil.isReport(node)) {
      reportId = node.storageId;
    } else if (ReportUtil.isCheckPoint(node)) {
      reportId = ReportUtil.getStorageIdFromUid(node.uid);
    }
    if (reportId == undefined) {
      this.toastService.showDanger(
        'Could not find report to apply custom action',
      );
    } else {
      this.httpService
        .processCustomReportAction(this.currentView.storageName, [reportId])
        .pipe(catchError(this.errorHandler.handleError()))
        .subscribe({
          next: (data: Record<string, string>) => {
            if (data.success) {
              this.toastService.showSuccess(data.success);
            }
            if (data.error) {
              this.toastService.showDanger(data.error);
            }
          },
          error: () => {
            this.toastService.showDanger(
              'Failed to process custom report action',
            );
          },
        });
    }
  }
}
