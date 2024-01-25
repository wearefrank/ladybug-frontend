import { Component, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier';
import { Subject, Subscription } from 'rxjs';
import { SettingsService } from '../shared/services/settings.service';

export const editorViewsConst = ['raw', 'xml'] as const;
export type EditorView = (typeof editorViewsConst)[number];

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrl: './custom-editor.component.css',
})
export class CustomEditorComponent implements OnInit, OnDestroy {
  protected readonly editorViewsConst = editorViewsConst;
  unsavedChanges: boolean = false;
  readOnlyMode: boolean = true; //Set to true for now until save and rerun is implemented
  options: any = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    readOnly: this.readOnlyMode,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    renderFinalNewline: false,
    scrollBeyondLastLine: false,
  };
  rawFile!: string;
  editorContent?: string;
  editorContentCopy?: string;
  isPrettified: boolean = false;
  currentView: EditorView = 'raw';
  editorFocused: boolean = false;
  @Output() saveReport: Subject<string> = new Subject<string>();
  @Input() height!: number;
  showPrettifyOnLoad: boolean = true;
  showPrettifyOnLoadSubscription!: Subscription;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.showPrettifyOnLoadSubscription = this.settingsService.prettifyOnLoadObservable.subscribe((value: boolean) => {
      this.showPrettifyOnLoad = value;
    });
  }

  ngOnDestroy(): void {
    this.showPrettifyOnLoadSubscription.unsubscribe();
  }

  initEditor(editor: any): void {
    if (editor) {
      editor.onDidFocusEditorWidget(() => {
        this.editorFocused = true;
      });

      editor.onDidBlurEditorWidget(() => {
        this.editorFocused = false;
      });
      this.checkIfTextIsPretty();
      if (this.showPrettifyOnLoad) {
        this.onViewChange(editorViewsConst[1]);
      }
    }
  }

  checkIfTextIsPretty(): boolean {
    if (this.editorContent) {
      prettier
        .check(this.editorContent, {
          parser: 'html',
          plugins: [prettierPluginHtml],
          bracketSameLine: true,
        })
        .then((value: boolean) => (this.isPrettified = value));
    }
    return this.isPrettified;
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

  prettify(): void {
    if (this.editorContent) {
      prettier
        .format(this.editorContent, {
          parser: 'html',
          plugins: [prettierPluginHtml],
          bracketSameLine: true,
        })
        .then((result: string): void => {
          this.setValue(result);
          this.isPrettified = true;
        });
    }
  }

  @HostListener('window:keydown', ['$event'])
  onSave(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key == 's') {
      event.preventDefault();
      if (this.unsavedChanges) {
        this.save();
      }
    }
  }

  save(): void {
    if (this.editorContent) {
      this.saveReport.next(this.editorContent);
    }
  }

  onChange(event: string): void {
    this.unsavedChanges = event != this.editorContentCopy;
  }

  setNewReport(value: string): void {
    this.setValue(value);
    this.editorContentCopy = value;
    this.rawFile = value;
    this.checkIfTextIsPretty();
    if (this.showPrettifyOnLoad) {
      this.onViewChange(editorViewsConst[1]);
    }
  }

  setValue(value: string): void {
    this.editorContent = value;
  }
}
