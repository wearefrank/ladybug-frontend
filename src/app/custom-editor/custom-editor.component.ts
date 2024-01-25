import { Component, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SettingsService } from '../shared/services/settings.service';

export const editorViewsConst = ['raw', 'xml'] as const;
export type EditorView = (typeof editorViewsConst)[number];

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrl: './custom-editor.component.css',
})
export class CustomEditorComponent implements OnInit, OnDestroy {
  @Input() height!: number;
  @Output() saveReport: Subject<string> = new Subject<string>();
  protected readonly editorViewsConst = editorViewsConst;
  unsavedChanges: boolean = false;
  readOnlyMode: boolean = false; //Set to true for now until save and rerun is implemented
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
  showPrettifyOnLoad: boolean = true;
  showPrettifyOnLoadSubscription!: Subscription;
  editorChangesSubject: Subject<string> = new Subject<string>();

  @HostListener('window:keydown', ['$event'])
  onSave(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key == 's') {
      event.preventDefault();
      if (this.unsavedChanges) {
        this.save();
      }
    }
  }

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.showPrettifyOnLoadSubscription = this.settingsService.prettifyOnLoadObservable.subscribe((value: boolean) => {
      this.showPrettifyOnLoad = value;
    });
    this.subscribeToEditorChanges();
  }

  ngOnDestroy(): void {
    this.showPrettifyOnLoadSubscription.unsubscribe();
  }

  subscribeToEditorChanges(): void {
    this.editorChangesSubject.pipe(debounceTime(300)).subscribe((value) => {
      this.checkIfTextIsPretty();
    });
  }

  initEditor(editor: any): void {
    if (editor) {
      editor.onDidFocusEditorWidget((): void => {
        this.editorFocused = true;
      });
      editor.onDidBlurEditorWidget((): void => {
        this.editorFocused = false;
      });

      this.checkIfTextIsPretty();
      if (this.showPrettifyOnLoad) {
        this.onViewChange('xml');
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

  save(): void {
    if (this.editorContent) {
      this.saveReport.next(this.editorContent);
    }
  }

  onChange(event: string): void {
    this.editorChangesSubject.next(event);
    this.unsavedChanges = event != this.editorContentCopy;
  }

  setNewReport(value: string): void {
    this.setValue(value);
    this.editorContentCopy = value;
    this.rawFile = value;
    this.checkIfTextIsPretty();
    if (this.showPrettifyOnLoad) {
      this.onViewChange('xml');
    }
  }

  setValue(value: string): void {
    this.editorContent = value;
  }
}
