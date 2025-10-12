import { Component, Input, OnDestroy, OnInit, output, ViewChild } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subscription } from 'rxjs';
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';
import { Difference2ModalComponent } from '../../difference-modal/difference2-modal.component';
import { DifferencesBuilder } from 'src/app/shared/util/differences-builder';
import {
  NodeValueLabels,
  ReportAlertMessage2Component,
} from '../report-alert-message2/report-alert-message2.component';
import { NodeValueState, PartialReport } from '../report2.component';
import { ButtonCommand, ReportButtons, ReportButtonsState } from '../report-buttons/report-buttons';
import { StubStrategy } from 'src/app/shared/enums/stub-strategy';

export interface PartialCheckpoint {
  message: string | null;
  stubbed: boolean;
  // TODO: Server will not send undefined.
  encoding?: string | null;
  // TODO: Server will not send undefined.
  messageClassName?: string | null;
  showConverted?: boolean;
  preTruncatedMessageLength: number;
  stubNotFound?: string;
  stub: number;
  parentReport: PartialReport;
}

@Component({
  selector: 'app-checkpoint-value',
  imports: [MonacoEditorComponent, Difference2ModalComponent, ReportAlertMessage2Component, ReportButtons],
  templateUrl: './checkpoint-value.component.html',
  styleUrl: './checkpoint-value.component.css',
})
export class CheckpointValueComponent implements OnInit, OnDestroy {
  nodeValueState = output<NodeValueState>();
  button = output<ButtonCommand>();
  @Input() height = 0;
  @Input({ required: true }) originalCheckpoint$!: Observable<PartialCheckpoint | undefined>;
  @ViewChild(Difference2ModalComponent) saveModal!: Difference2ModalComponent;
  labels: NodeValueLabels | undefined;

  // TODO: No ReplaySubject!
  protected editorContentsSubject = new ReplaySubject<string>();
  protected editorReadOnlySubject = new ReplaySubject<boolean>();
  protected buttonStateSubject = new BehaviorSubject<ReportButtonsState>(
    CheckpointValueComponent.getButtonState(CheckpointValueComponent.getDefaultNodeValueState()),
  );
  protected originalCheckpointStubStrategySubject = new BehaviorSubject<number | undefined>(undefined);
  protected originalReportStubStrategySubject = new BehaviorSubject<string | undefined>(undefined);
  private originalCheckpoint: PartialCheckpoint | undefined;
  private actualEditorContents = '';
  private actualCheckpointStubStrategy?: number;
  private actualReportStubStrategy?: string;
  private emptyIsNull = true;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.originalCheckpoint$.subscribe((value: PartialCheckpoint | undefined) => {
        if (value !== undefined) {
          this.newOriginalCheckpoint(value);
        }
      }),
    );
    this.editorReadOnlySubject.next(false);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onActualEditorContentsChanged(value: string): void {
    // We set the actualEditorContents already when we request new editor contents.
    // When the new value is converted, we do not have to react.
    if (this.actualEditorContents === value) {
      return;
    }
    this.actualEditorContents = value;
    if (this.actualEditorContents.length > 0) {
      this.emptyIsNull = false;
    }
    this.handleLabelsAndNodeValueState();
  }

  onCheckpointStubStrategyChange(strategy: number): void {
    this.actualCheckpointStubStrategy = strategy;
    this.handleLabelsAndNodeValueState();
  }

  onReportStubStrategyChange(strategy: string): void {
    this.actualReportStubStrategy = strategy;
    this.handleLabelsAndNodeValueState();
  }

  onButton(command: ButtonCommand): void {
    if (command === 'close') {
      this.button.emit('close');
    }
    if (command === 'makeNull') {
      this.editToNull();
    }
    if (command === 'save') {
      this.saveCheckpoint();
    }
    if (command === 'copyReport') {
      this.button.emit('copyReport');
    }
  }

  getDifferences(): DifferencesBuilder {
    if (this.originalCheckpoint === undefined) {
      throw new Error('CheckpointValueComponent.getDifferences(): Did not expect originalCheckpoint to be undefined');
    }
    if (this.actualCheckpointStubStrategy === undefined) {
      throw new Error(
        'CheckpointValueComponent.getDifferences(): Expected that actualCheckpointStubStrategy !== undefined because a checkpoint was read',
      );
    }
    if (this.actualReportStubStrategy === undefined) {
      throw new Error(
        'CheckpointValueComponent.getDifferences(): Did not expect actualReportStubStrategy to be undefined',
      );
    }
    return new DifferencesBuilder()
      .nullableVariable(this.originalCheckpoint.message, this.getEditedRealCheckpointValue(), 'Value', true)
      .nonNullableVariable(
        this.originalCheckpoint.parentReport.stubStrategy,
        this.actualReportStubStrategy,
        'Report level stub strategy',
      )
      .nonNullableVariable(
        StubStrategy.checkpoints[this.originalCheckpoint.stub],
        StubStrategy.checkpoints[this.actualCheckpointStubStrategy],
        "This checkpoint's stub strategy",
      );
  }

  getEditedRealCheckpointValue(): string | null {
    if (this.emptyIsNull) {
      return this.actualEditorContents.length === 0 ? null : this.actualEditorContents;
    } else {
      return this.actualEditorContents;
    }
  }

  protected monacoOptions: Partial<monaco.editor.IStandaloneEditorConstructionOptions> = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    scrollBeyondLastLine: false,
  };

  private newOriginalCheckpoint(originalCheckpoint: PartialCheckpoint | undefined): void {
    if (originalCheckpoint === undefined) {
      throw new Error('CheckpointValueComponent.neworiginalCheckpoint(): Did not expect to receive value undefined');
    }
    this.originalCheckpoint = originalCheckpoint;
    this.emptyIsNull = this.originalCheckpoint.message === null;
    const requestedEditorContents = originalCheckpoint.message === null ? '' : originalCheckpoint.message;
    // Do not trust the Monaco editor sends an event for the first text.
    this.actualEditorContents = requestedEditorContents;
    this.actualCheckpointStubStrategy = originalCheckpoint.stub;
    this.actualReportStubStrategy = originalCheckpoint.parentReport.stubStrategy;
    this.handleLabelsAndNodeValueState();
    this.editorContentsSubject.next(requestedEditorContents);
    this.originalCheckpointStubStrategySubject.next(originalCheckpoint.stub);
    this.originalReportStubStrategySubject.next(originalCheckpoint.parentReport.stubStrategy);
  }

  private editToNull(): void {
    this.emptyIsNull = true;
    // Do not trust the Monaco editor sends an event for the updated text.
    this.actualEditorContents = '';
    // Editor contents may be the empty string, then still saved changes.
    this.handleLabelsAndNodeValueState();
    this.editorContentsSubject.next('');
  }

  private handleLabelsAndNodeValueState(): void {
    if (this.originalCheckpoint === undefined) {
      throw new Error(
        'CheckpointValueComponent.handleLabelsAndNodeValueState(): Did not expect that there was no checkpoint',
      );
    }
    if (this.actualCheckpointStubStrategy === undefined) {
      throw new Error(
        'CheckpointValueComponent.handleLabelsAndNodeValueState(): Expected that actualCheckpointStubStrategy !== undefined because a checkpoint was read',
      );
    }
    if (this.actualReportStubStrategy === undefined) {
      throw new Error(
        'CheckpointValueComponent.handleLabelsAndNodeValueState(): Expected that actualReportStubStrategy !== undefined because a checkpoint was read',
      );
    }
    const editedCheckpointValue = this.getEditedRealCheckpointValue();
    const isCheckpointEdited = editedCheckpointValue !== this.originalCheckpoint.message;
    const isCheckpointStubStrategyEdited = this.actualCheckpointStubStrategy !== this.originalCheckpoint.stub;
    const isReportStubStrategyEdited =
      this.actualReportStubStrategy !== this.originalCheckpoint.parentReport.stubStrategy;
    const isEdited = isCheckpointEdited || isCheckpointStubStrategyEdited || isReportStubStrategyEdited;
    this.labels = {
      isEdited,
      isMessageNull: editedCheckpointValue === null,
      isMessageEmpty: editedCheckpointValue === '',
      stubbed: this.originalCheckpoint.stubbed,
      encoding: CheckpointValueComponent.getEncoding(this.originalCheckpoint.encoding),
      messageClassName:
        this.originalCheckpoint.messageClassName === undefined || this.originalCheckpoint.messageClassName === null
          ? undefined
          : this.originalCheckpoint.messageClassName,
      charactersRemoved: CheckpointValueComponent.getCharactersRemoved(
        this.originalCheckpoint.message,
        this.originalCheckpoint.preTruncatedMessageLength,
      ),
      stubNotFound: this.originalCheckpoint.stubNotFound,
    };
    const isReadOnly = this.originalCheckpoint ? !this.originalCheckpoint.parentReport.crudStorage : true;
    this.nodeValueState.emit({
      isReadOnly,
      isEdited,
      storageId: this.originalCheckpoint?.parentReport.storageId,
    });
  }

  private static getEncoding(e: string | null | undefined): string | undefined {
    return e === undefined || e === null || e.length === 0 ? undefined : e;
  }

  private static getCharactersRemoved(originalMessage: string | null, preTruncatedMessageLength: number): number {
    // In the backend code you see that a negative number is returned for unspecified.
    if (preTruncatedMessageLength < 0) {
      return 0;
    }
    const originalLength = originalMessage === null ? 0 : originalMessage.length;
    return preTruncatedMessageLength - originalLength;
  }

  private saveCheckpoint(): void {
    this.saveModal.open(this.getDifferences().build(), 'save');
  }

  private static getButtonState(nodeValueState: NodeValueState): ReportButtonsState {
    const saveAllowed = nodeValueState.isEdited && !nodeValueState.isReadOnly;
    return {
      isReport: false,
      isCheckpoint: true,
      saveAllowed: saveAllowed,
      isReadOnly: nodeValueState.isReadOnly,
    };
  }

  private static getDefaultNodeValueState(): NodeValueState {
    return { isReadOnly: true, isEdited: false };
  }
}
