import { Component, HostListener, Output } from '@angular/core';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

export const editorViewsConst = ['raw', 'xml'] as const;
export type EditorView = typeof editorViewsConst[number];

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrl: './custom-editor.component.css',
})
export class CustomEditorComponent {
  protected readonly editorViewsConst = editorViewsConst;
  unsavedChanges: boolean = false;
  readOnlyMode: boolean = true;
  options: any = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    readOnly: this.readOnlyMode,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    renderFinalNewline: false,
    statusBar: true,
    scrollBeyondLastLine: false,
  };
  rawFile!: string;
  editorContent?: string;
  editorContentCopy?: string;
  isPrettified: boolean = false;
  currentView: EditorView = 'raw';
  editorFocused: boolean = false;

  @Output() saveReport: Subject<string> = new Subject<string>();

  constructor(private modalService: NgbModal) {}

  prettify(): void {
    if (this.editorContent) {
      prettier
        .check(this.editorContent, {
          parser: 'html',
          plugins: [prettierPluginHtml],
        })
        .then((value) => {
          if (!value && this.editorContent) {
            prettier
              .format(this.editorContent, {
                parser: 'html',
                plugins: [prettierPluginHtml],
                bracketSameLine: true,
              })
              .then((result: string) => {
                this.setValue(result);
              });
          }
        });
    }
  }

  checkIfTextIsPretty() {
    if (this.editorContent) {
      prettier
        .check(this.editorContent, {
          parser: 'html',
          plugins: [prettierPluginHtml],
          bracketSameLine: true,
        })
        .then((value: boolean) => (this.isPrettified = value));
    }
  }

  initEditor(editor: any): void {
    if (editor) {
      editor.onDidFocusEditorWidget(() => {
        this.editorFocused = true;
      });

      editor.onDidBlurEditorWidget(() => {
        this.editorFocused = false;
      });

      setTimeout(() => {
        this.checkIfTextIsPretty();
      }, 100);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onSave(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key == 's') {
      event.preventDefault();
      if (this.unsavedChanges) {
        this.save();
      }
    }
  }

  save() {
    if (this.editorContent) {
      this.saveReport.next(this.editorContent);
    }
  }

  onChange(event: string) {
    this.unsavedChanges = event != this.editorContentCopy;
  }

  setNewReport(value: string): void {
    this.setValue(value);
    this.editorContentCopy = value;
    this.rawFile = value;
  }

  setValue(value: string): void {
    this.editorContent = value;
  }

  onViewChange(value: EditorView): void {
    const index: number = editorViewsConst.indexOf(value);
    if (index == -1) {
      return;
    }
    this.currentView = editorViewsConst[index];
    if (this.currentView == 'raw') {
      this.editorContent = this.rawFile;
    }
    if (this.currentView == 'xml') {
      this.prettify();
    }
  }

  showEditorPossibilitiesModal(modal: any): void {
    this.modalService.open(modal, { backdrop: true });
  }

  closeModal() {
    this.modalService.dismissAll();
  }
}
