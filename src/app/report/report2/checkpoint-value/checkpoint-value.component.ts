import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-checkpoint-value',
  imports: [MonacoEditorComponent],
  templateUrl: './checkpoint-value.component.html',
  styleUrl: './checkpoint-value.component.css',
})
export class CheckpointValueComponent implements OnInit {
  @Input() height = 0;

  protected editorContentsSubject = new ReplaySubject<string>();
  protected editorReadOnlySubject = new ReplaySubject<boolean>();
  private _originalValue: string | null = null;

  @Input() set originalValue(originalValue: string | null) {
    this._originalValue = originalValue;
    this.editorContentsSubject.next(originalValue === null ? '' : originalValue);
  }

  ngOnInit(): void {
    this.editorReadOnlySubject.next(false);
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
}
