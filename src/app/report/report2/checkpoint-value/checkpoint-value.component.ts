import { Component, Input, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, ReplaySubject, Subscription } from 'rxjs';
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-checkpoint-value',
  imports: [MonacoEditorComponent],
  templateUrl: './checkpoint-value.component.html',
  styleUrl: './checkpoint-value.component.css',
})
export class CheckpointValueComponent implements OnInit, OnDestroy {
  savedChanges = output<boolean>();
  @Input() height = 0;
  @Input({ required: true }) originalValue$!: Observable<string | null>;
  @Input({ required: true }) editToNull$!: Observable<void>;
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
    this.subscriptions.add(this.originalValue$.subscribe((value: string | null) => this.newOriginalValue(value)));
    this.subscriptions.add(this.editToNull$.subscribe(() => this.editToNull()));
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

  protected editToNull(): void {
    this.emptyIsNull = true;
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
    this.savedChanges.emit(true);
    this.originalValue = originalValue;
    this.emptyIsNull = this.originalValue === null;
    this.editorContentsSubject.next(originalValue === null ? '' : originalValue);
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
}
