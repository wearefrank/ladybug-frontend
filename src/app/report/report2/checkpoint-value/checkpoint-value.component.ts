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
  @Input() originalValue$!: Observable<string | null>;

  protected editorContentsSubject = new ReplaySubject<string>();
  protected editorReadOnlySubject = new ReplaySubject<boolean>();
  private originalValue: string | null = null;
  private editedValue: string | null = null;
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.originalValue$.subscribe((value: string | null) => this.newOriginalValue(value)));
    this.editorReadOnlySubject.next(false);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onActualEditorContentsChanged(value: string): void {
    this.editedValue = value;
    // TODO: Handle possibility of null.
    if (this.editedValue === this.originalValue) {
      this.savedChanges.emit(true);
    } else {
      this.savedChanges.emit(false);
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

  private newOriginalValue(originalValue: string | null): void {
    this.originalValue = originalValue;
    this.editorContentsSubject.next(originalValue === null ? '' : originalValue);
  }
}
