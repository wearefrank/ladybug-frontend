import { Component, Input } from '@angular/core';
import { MonacoEditorComponent } from 'src/app/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-checkpoint-value',
  imports: [MonacoEditorComponent],
  templateUrl: './checkpoint-value.component.html',
  styleUrl: './checkpoint-value.component.css',
})
export class CheckpointValueComponent {
  @Input() height = 0;

  protected originalMonacoEditorContents = '';
  private _originalValue: string | null = null;

  @Input() set originalValue(originalValue: string | null) {
    this._originalValue = originalValue;
    this.originalMonacoEditorContents = originalValue === null ? '' : originalValue;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
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
