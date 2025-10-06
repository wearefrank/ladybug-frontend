import { Component, Input, OnDestroy, OnInit, output, ViewChild } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';
import { Difference2ModalComponent } from '../../difference-modal/difference2-modal.component';
import { DifferencesBuilder } from 'src/app/shared/util/differences-builder';

export interface PartialCheckpoint {
  message: string | null;
  stubbed: boolean;
  encoding?: string;
  preTruncatedMessageLength: number;
  stubNotFound?: string;
  stub: number;
}

@Component({
  selector: 'app-checkpoint-value',
  imports: [MonacoEditorComponent, Difference2ModalComponent],
  templateUrl: './checkpoint-value.component.html',
  styleUrl: './checkpoint-value.component.css',
})
export class CheckpointValueComponent implements OnInit, OnDestroy {
  savedChanges = output<boolean>();
  @Input() height = 0;
  @Input({ required: true }) originalCheckpoint$!: Observable<PartialCheckpoint | undefined>;
  @Input({ required: true }) editToNull$!: Observable<void>;
  @Input({ required: true }) save$!: Observable<void>;
  @ViewChild(Difference2ModalComponent) saveModal!: Difference2ModalComponent;

  protected editorContentsSubject = new ReplaySubject<string>();
  protected editorReadOnlySubject = new ReplaySubject<boolean>();
  private originalCheckpoint: PartialCheckpoint | undefined;
  private actualEditorContents = '';
  private emptyIsNull = true;
  private subscriptions = new Subscription();

  constructor() {
    console.log('Construct CheckpointValueComponent');
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.originalCheckpoint$.subscribe((value: PartialCheckpoint | undefined) => {
        if (value !== undefined) {
          this.neworiginalCheckpoint(value);
        }
      }),
    );
    this.subscriptions.add(this.editToNull$.subscribe(() => this.editToNull()));
    this.subscriptions.add(this.save$.subscribe(() => this.saveCheckpoint()));
    this.editorReadOnlySubject.next(false);
  }

  ngOnDestroy(): void {
    console.log('Destroy CheckpointValueComponent');
    this.subscriptions.unsubscribe();
  }

  getEditedRealCheckpointValue(): string | null {
    if (this.emptyIsNull) {
      return this.actualEditorContents.trim().length === 0 ? null : this.actualEditorContents;
    } else {
      return this.actualEditorContents;
    }
  }

  onActualEditorContentsChanged(value: string): void {
    console.log('CheckpointValueComponent.onActualEditorContentsChanged()');
    this.actualEditorContents = value;
    if (this.actualEditorContents.trim().length > 0) {
      this.emptyIsNull = false;
    }
    this.handleSavedChanges();
  }

  getDifferences(): DifferencesBuilder {
    if (this.originalCheckpoint === undefined) {
      throw new Error('CheckpointValueComponent.getDifferences(): Did not expect originalCheckpoint to be undefined');
    }
    console.log(`CheckpointValueComponent.getDifferences(): edited ${this.getEditedRealCheckpointValue()}`);
    return new DifferencesBuilder().nullableVariable(
      this.originalCheckpoint.message,
      this.getEditedRealCheckpointValue(),
      'Value',
      true,
    );
  }

  protected editToNull(): void {
    this.emptyIsNull = true;
    // Do not trust the Monaco editor sends an event for the updated text.
    this.actualEditorContents = '';
    // Editor contents may be the empty string, then still saved changes.
    this.handleSavedChanges();
    this.editorContentsSubject.next('');
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

  private neworiginalCheckpoint(originalCheckpoint: PartialCheckpoint | undefined): void {
    if (originalCheckpoint === undefined) {
      throw new Error('CheckpointValueComponent.neworiginalCheckpoint(): Did not expect to receive value undefined');
    }
    console.log('CheckpointValueComponent.neworiginalCheckpoint(): also emits savedChanges');
    this.originalCheckpoint = originalCheckpoint;
    this.emptyIsNull = this.originalCheckpoint.message === null;
    const requestedEditorContents = originalCheckpoint.message === null ? '' : originalCheckpoint.message;
    // Do not trust the Monaco editor sends an event for the first text.
    this.actualEditorContents = requestedEditorContents;
    this.savedChanges.emit(true);
    this.editorContentsSubject.next(requestedEditorContents);
  }

  private handleSavedChanges(): void {
    if (this.originalCheckpoint === undefined) {
      throw new Error('CheckpointValueComponent.handleSavedChanges(): Did not expect that there was no checkpoint');
    }
    if (this.getEditedRealCheckpointValue() === this.originalCheckpoint.message) {
      console.log('CheckpointValueComponent.handleSavedChanges(true)');
      this.savedChanges.emit(true);
    } else {
      console.log('CheckpointValueComponent.handleSavedChanges(false)');
      this.savedChanges.emit(false);
    }
  }

  private saveCheckpoint(): void {
    this.saveModal.open(this.getDifferences().build(), 'save');
  }
}
