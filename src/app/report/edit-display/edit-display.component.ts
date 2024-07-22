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
import { MetadataTableComponent } from '../../shared/components/display-table/metadata-table.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgClass, NgStyle, TitleCasePipe } from '@angular/common';
import { BooleanToStringPipe } from '../../shared/pipes/boolean-to-string.pipe';
import { catchError, Subject } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { ChangesAction, DifferenceModalComponent } from '../difference-modal/difference-modal.component';
import { ToggleButtonComponent } from '../../shared/components/button/toggle-button/toggle-button.component';
import { ToastService } from '../../shared/services/toast.service';
import { TestResult } from '../../shared/interfaces/test-result';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';
import { UpdateReport } from '../../shared/interfaces/update-report';
import { UpdateCheckpoint } from '../../shared/interfaces/update-checkpoint';
import { UpdateReportUtil } from '../../shared/util/update-report-util';
import { Checkpoint } from '../../shared/interfaces/checkpoint';

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
  ],
})
export class EditDisplayComponent {
  protected readonly ReportUtil = ReportUtil;
  @Input() id: string = '';
  @Input() containerHeight!: number;
  @Input() currentView: any = {};
  @Input() newTab: boolean = true;
  @Output() saveReportEvent: Subject<any> = new Subject<any>();
  @Output() closeReportEvent: Subject<Report> = new Subject<Report>();
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
  ) {}

  showReport(node: Report | Checkpoint): void {
    this.disableEditing();
    this.selectedNode = node;
    if (ReportUtil.isReport(this.selectedNode)) {
      this.editor.setNewReport(this.selectedNode.xml);
    } else if (ReportUtil.isCheckPoint(this.selectedNode)) {
      this.editor.setNewReport(this.helperService.convertMessage(this.selectedNode));
    }
    this.rerunResult = undefined;
    this.displayReport = true;
  }

  changeEncoding(button: MouseEvent): void {
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (!node || !ReportUtil.isCheckPoint(node)) {
      this.toastService.showDanger('Could not find report to change encoding');
      return;
    }
    this.editor.setNewReport(this.helperService.changeEncoding(node, button));
  }

  rerunReport(): void {
    const reportId: number = this.report.storageId;
    this.httpService.runReport(this.currentView.storageName, reportId).subscribe({
      next: (response: TestResult): void => {
        this.toastService.showSuccess('Report rerun successful');
        this.rerunResult = response;
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  closeReport(removeReportFromTree: boolean): void {
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (!node || !ReportUtil.isReport(node)) {
      this.toastService.showDanger('Could not find report to close');
      return;
    }
    this.displayReport = false;
    this.editingRootNode = false;
    this.editingChildNode = false;
    if (removeReportFromTree) {
      this.closeReportEvent.next(node);
    }
    this.editor.setNewReport('');
  }

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (!node) {
      this.toastService.showDanger('Could not find report to download');
      return;
    }
    let queryString: string;
    queryString = ReportUtil.isReport(node) ? node.storageId.toString() : node.uid.split('#')[0];
    this.helperService.download(`${queryString}&`, this.currentView.storageName, exportBinary, exportXML);
    this.httpService.handleSuccess('Report Downloaded!');
  }

  selectStubStrategy(event: Event): void {
    this.saveChanges(Number.parseInt((event.target as HTMLOptionElement).value));
  }

  openDifferenceModal(type: ChangesAction): void {
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (!node) {
      this.toastService.showDanger('Could not find report to open difference modal');
      return;
    }
    let reportDifferences: ReportDifference[] = [];
    if (this.report.xml && this.editFormComponent) {
      reportDifferences = this.editFormComponent.getDifferences();
    } else if (this.report.message) {
      reportDifferences.push({
        name: 'message',
        originalValue: this.report.message,
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
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (node && ReportUtil.isReport(node)) {
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
    const node: Report | Checkpoint | undefined = this.selectedNode;
    let checkpointId: string = '';
    let storageId: string;
    if (node && ReportUtil.isReport(node)) {
      storageId = String(node.storageId);
    } else if (node) {
      storageId = node.uid.split('#')[0];
      checkpointId = node.uid.split('#')[1];
    } else {
      this.toastService.showDanger('Could not find report to save');
      return;
    }

    const body = this.getReportValues(checkpointId);

    this.httpService.updateReport(storageId, body, this.currentView.storageName).subscribe({
      next: (response: any) => {
        response.report.xml = response.xml;
        this.report = response.report;
        this.saveReportEvent.next(this.report);
        this.editor.setNewReport(UpdateReportUtil.isUpdateCheckpoint(body) ? body.checkpointMessage : this.report.xml);
        this.disableEditing();
      },
      error: () => catchError(this.errorHandler.handleError()),
    });
  }

  discardChanges(): void {
    this.disableEditing();
    if (this.report.uid) {
      this.editor.setNewReport(this.report.message);
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
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (!node) {
      this.toastService.showDanger('Could not find report to copy');
      return;
    }
    const storageId: number = ReportUtil.isReport(node)
      ? node.storageId
      : node.storageId
        ? Number.parseInt(node.storageId)
        : Number.parseInt(node.uid.split('#')[0]);
    const data: Record<string, number[]> = {
      [this.currentView.storageName]: [storageId],
    };
    this.httpService.copyReport(data, 'Test').subscribe({
      error: catchError(this.errorHandler.handleError()),
    }); // TODO: storage is hardcoded, fix issue #196 for this
  }

  toggleEditMode(value: boolean): void {
    if (value) {
      this.editReport();
    } else {
      this.disableEditing();
    }
  }

  toggleToolTip(toolTip: MatTooltip): void {
    toolTip.show();
    setTimeout(() => toolTip.hide(), 2500);
  }
}
