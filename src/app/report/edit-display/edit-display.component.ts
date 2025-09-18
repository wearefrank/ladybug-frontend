/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
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
} from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../shared/services/http.service';
import DiffMatchPatch from 'diff-match-patch';
import { HelperService } from '../../shared/services/helper.service';
import { Report } from '../../shared/interfaces/report';
import { MetadataTableComponent } from '../../shared/components/metadata-table/metadata-table.component';
import { MessagecontextTableComponent } from '../../shared/components/messagecontext-table/messagecontext-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BooleanToStringPipe } from '../../shared/pipes/boolean-to-string.pipe';
import { catchError } from 'rxjs';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { EditFormComponent } from '../edit-form/edit-form.component';
import { ChangesAction, DifferenceModalComponent } from '../difference-modal/difference-modal.component';
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
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';
import { MonacoAdapter } from 'src/app/editor/monaco-adapter';

interface ToastCallbackButton {
  callbackButtonText: string,
  callback: () => void
}

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
    MonacoEditorComponent,
  ],
})
export class EditDisplayComponent implements AfterViewInit, OnChanges {
  @Input() containerHeight!: number;
  @Input({ required: true }) currentView!: View;
  @Input() newTab = true;
  @ViewChild(EditFormComponent) editFormComponent!: EditFormComponent;
  @ViewChild(DifferenceModalComponent)
  differenceModal!: DifferenceModalComponent;
  @ViewChild('topComponent') topComponent?: ElementRef;
  @ViewChild('editToggleButton') editToggleButton!: ToggleButtonComponent;

  // These variables control directly what is shown.
  selectedNode?: Report | Checkpoint;
  metadataTableVisible = false;
  messageContextTableVisible = false;
  toggleEditingEnabled = false;
  reportStubStrategy?: string;
  checkpointStub?: number;
  rerunResult?: TestResult;
  isEditing: boolean = false;
  originalCheckpointValue?: string | null;
  monacoEditorHeight!: number;
  options: any = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    renderFinalNewline: false,
    scrollBeyondLastLine: false,
  };
  requestedMonacoEditorContent: string = '';
  monacoEditorHasUnsavedChanges = false;
  displayReport = false;

  protected readonly ReportUtil = ReportUtil;
  protected readonly Number: NumberConstructor = Number;
  protected readonly StubStrategy = StubStrategy;
  protected appVariablesService = inject(AppVariablesService);
  private httpService = inject(HttpService);
  private helperService = inject(HelperService);
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandling);
  private testReportsService = inject(TestReportsService);
  private debugTab = inject(DebugTabService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  private monacoCheckpointAdapter = new MonacoAdapter(true);

  ngAfterViewInit(): void {
    this.setMonacoEditorHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['containerHeight']) {
      this.setMonacoEditorHeight();
    }
  }

  showReport(node: Report | Checkpoint): void {
    this.isEditing = false;
    this.toggleEditingEnabled = false;
    this.selectedNode = node;
    this.metadataTableVisible = false;
    this.messageContextTableVisible = false;
    this.checkpointStub = node.stub;
    this.rerunResult = undefined;
    this.monacoCheckpointAdapter.clear();
    if (ReportUtil.isReport(this.selectedNode)) {
      this.reportStubStrategy = this.selectedNode.stubStrategy;
      this.requestedMonacoEditorContent = this.monacoCheckpointAdapter.setOriginalCheckpointValue(this.selectedNode.xml, 'not-monaco-editable');
    } else if (ReportUtil.isCheckPoint(this.selectedNode)) {
      this.reportStubStrategy = undefined;
      const selectedNodeAsCheckpoint = this.selectedNode as Checkpoint;
      if (selectedNodeAsCheckpoint.encoding) {
        this.requestedMonacoEditorContent = this.monacoCheckpointAdapter.setOriginalCheckpointValue(selectedNodeAsCheckpoint.message, 'not-editable');
      } else {
        this.requestedMonacoEditorContent = this.monacoCheckpointAdapter.setOriginalCheckpointValue(selectedNodeAsCheckpoint.message, 'monaco-editable');
      }
    }
    this.applyMonacoAdapterChanges();
    this.rerunResult = undefined;
    this.displayReport = true;
  }

  closeReport(): void {
    this.displayReport = false;
    this.monacoCheckpointAdapter.clear();
    this.applyMonacoAdapterChanges();
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

  downloadReport(exportBinary: boolean, exportXML: boolean): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let queryString = 'id=';
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
    this.helperService.download(`${queryString}&`, this.currentView.storageName, exportBinary, exportXML);
    this.toastService.showSuccess('Report Downloaded!');
  }

  toggleMetadataTable(): void {
    this.metadataTableVisible = !this.metadataTableVisible;
  }

  toggleMessageContextTable(): void {
    this.messageContextTableVisible = !this.messageContextTableVisible;
  }

  toggleEditMode(value: boolean): void {
    if (this.selectedNode && ReportUtil.isFromCrudStorage(this.selectedNode)) {
      if (this.monacoCheckpointAdapter.getEditingMakesSense()) {
        if(this.monacoCheckpointAdapter.getValueIsShownPretty()) {
          this.showToastWarning('Cannot edit value that is shown prettified');
        } else {
          this.changeEditMode(value);
        }
      } else {
        this.showToastWarning('Shown value is encoded, cannot edit');
      }
    } else {
      this.showNotEditableWarning();
    }
  }

  openDifferenceModal(type: ChangesAction): void {
    const node: Report | Checkpoint = this.selectedNode!;
    let reportDifferences: ReportDifference[] = [];
    if (ReportUtil.isReport(node) && this.editFormComponent) {
      reportDifferences = this.editFormComponent.getDifferences();
    } else if (ReportUtil.isCheckPoint(node) && this.monacoEditorHasUnsavedChanges) {
      const diff = new DiffMatchPatch().diff_main(
        this.forDifference(this.monacoCheckpointAdapter.getOriginalCheckpointValue()),
        this.forDifference(this.monacoCheckpointAdapter.getEditedCheckpointValue()));
      reportDifferences.push({
        name: 'message',
        originalValue: this.forDifference(node.message),
        difference: diff,
      });
    }

    if (reportDifferences.length > 0) {
      this.differenceModal.open(reportDifferences, type);
    } else if (type === 'saveRerun') {
      this.rerunReport();
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
        body = checkpointId ? { stub: this.checkpointStub, checkpointId: checkpointId } : { stubStrategy: this.reportStubStrategy };
      } else {
        body = this.getReportValues(checkpointId);
      }
      this.updateReport(storageId, body, node);
    } else {
      this.toastService.showWarning('Please select a node in the debug tree');
    }
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

  onActualMonacoEditorContentsChange(value: string): void {
    this.monacoCheckpointAdapter.onEditorContentsChanged(value);
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
    if (this.toggleEditingEnabled) {
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
      this.editor.setNewCheckpoint(node.message);
    }
    this.toastService.showSuccess('Changes discarded!');
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
      this.toastService.showDanger('Could not find report to apply custom action');
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
            this.toastService.showDanger('Failed to process custom report action');
          },
        });
    }
  }

  private setMonacoEditorHeight(): void {
    const topComponentHeight = this.topComponent ? this.topComponent?.nativeElement.offsetHeight : 47;
    this.monacoEditorHeight = this.containerHeight - topComponentHeight;
    this.cdr.detectChanges();
  }

  private applyMonacoAdapterChanges() {
    this.monacoEditorHasUnsavedChanges = this.monacoCheckpointAdapter.hasUnsavedChanges();
  }

  private changeEditMode(value: boolean): void {
    if (value) {
      this.isEditing = true;
    } else {
      this.disableEditing();
    }
  }

  private disableEditing() {
    this.isEditing = false;
    const node: Report | Checkpoint = this.selectedNode!;
    if (ReportUtil.isCheckPoint(node)) {
      this.requestedMonacoEditorContent = this.monacoCheckpointAdapter.discardChanges();
    }
  }

  private showNotEditableWarning(): void {
    this.showToastWarning('This storage is readonly, copy to the test tab to edit this report.', {
      callbackButtonText: 'Copy to testtab',
      callback: () => this.copyReport()
    })
  }

  private showToastWarning(buttonText: string, callback?: ToastCallbackButton) {
    this.toastService.showWarning(buttonText,
      callback ? {
        buttonText: callback.callbackButtonText,
        callback: callback.callback
      } : undefined
    );
    setTimeout(() => {
      this.editToggleButton.value = false;
    });
  }

  private forDifference(value: string | null): string {
    return value === null ? 'null' : `not null: ${value}`;
  }

  /* Copied */

  //Settings attributes
  showPrettifyOnLoad = true;
  availableViews!: EditorView[];
  contentType!: EditorView;

  private actualEditorContent?: string | null;

  private subscriptions: Subscription = new Subscription();

  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);

  @HostListener('window:keydown', ['$event'])
  keyBoardListener(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.onSave();
    }
  }

  ngOnInit(): void {
    this.subscribeToSettings();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSave(): void {
    if (this.unsavedChanges && this.requestedMonacoEditorContent) {
      this.openDifferenceModal('save');
    }
  }

  subscribeToSettings(): void {
    const prettifyOnLoad: Subscription = this.settingsService.prettifyOnLoadObservable.subscribe((value: boolean) => {
      this.showPrettifyOnLoad = value;
    });
    this.subscriptions.add(prettifyOnLoad);
  }

  initEditor(): void {
    this.checkIfTextIsPretty();
    if (this.showPrettifyOnLoad) {
      this.onViewChange(this.contentType);
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  getValue(): string {
    return this.actualEditorContent ?? '';
  }
}
