import { Component, Input, OnDestroy, OnInit, output, ViewChild } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';
import { Difference2ModalComponent } from '../../difference-modal/difference2-modal.component';
import { DifferencesBuilder } from 'src/app/shared/util/differences-builder';

@Component({
  selector: 'app-checkpoint-value',
  imports: [MonacoEditorComponent, Difference2ModalComponent],
  templateUrl: './checkpoint-value.component.html',
  styleUrl: './checkpoint-value.component.css',
})
export class CheckpointValueComponent implements OnInit, OnDestroy {
  savedChanges = output<boolean>();
  @Input() height = 0;
  @Input({ required: true }) originalValue$!: Observable<string | null | undefined>;
  @Input({ required: true }) editToNull$!: Observable<void>;
  @Input({ required: true }) save$!: Observable<void>;
  @ViewChild(Difference2ModalComponent) saveModal!: Difference2ModalComponent;

  protected editorContentsSubject = new ReplaySubject<string>();
  protected editorReadOnlySubject = new ReplaySubject<boolean>();
  private originalValue: string | null = null;
  private actualEditorContents = '';
  private emptyIsNull = true;
  private subscriptions = new Subscription();

  constructor() {
    console.log('Construct CheckpointValueComponent');
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.originalValue$.subscribe((value: string | null | undefined) => {
        if (value !== undefined) {
          this.newOriginalValue(value);
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
    console.log(`CheckpointValueComponent.getDifferences(): edited ${this.getEditedRealCheckpointValue()}`);
    return new DifferencesBuilder().nullableVariable(
      this.originalValue,
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

  private newOriginalValue(originalValue: string | null): void {
    console.log('CheckpointValueComponent.newOriginalValue(): also emits savedChanges');
    this.originalValue = originalValue;
    this.emptyIsNull = this.originalValue === null;
    const requestedEditorContents = originalValue === null ? '' : originalValue;
    // Do not trust the Monaco editor sends an event for the first text.
    this.actualEditorContents = requestedEditorContents;
    this.savedChanges.emit(true);
    this.editorContentsSubject.next(requestedEditorContents);
  }

  private handleSavedChanges(): void {
    if (this.getEditedRealCheckpointValue() === this.originalValue) {
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
