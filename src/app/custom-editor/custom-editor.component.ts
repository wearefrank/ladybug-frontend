import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SettingsService } from '../shared/services/settings.service';
import { editor } from 'monaco-editor';
import IEditor = editor.IEditor;

export const basicContentTypes = ['raw'] as const;
export type BasicView = (typeof basicContentTypes)[number];
export const prettyContentTypes = ['xml', 'json'] as const;
export type PrettyView = (typeof prettyContentTypes)[number];
export const editorViewsConst = [...basicContentTypes, ...prettyContentTypes] as const;
export type EditorView = (typeof editorViewsConst)[number];

@Component({
  selector: 'app-custom-editor',
  templateUrl: './custom-editor.component.html',
  styleUrl: './custom-editor.component.css',
})
export class CustomEditorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() height!: number;
  @Input() readOnlyMode: boolean = true;
  @Output() saveReport: Subject<string> = new Subject<string>();
  editor!: IEditor;
  unsavedChanges: boolean = false;
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
  editorChangesSubject: Subject<string> = new Subject<string>();
  INDENT_TWO_SPACES: string = '  ';

  //Settings attributes
  showPrettifyOnLoad: boolean = true;
  showPrettifyOnLoadSubscription!: Subscription;
  showSearchWindowOnLoad: boolean = true;
  showSearchWindowOnLoadSubscription!: Subscription;
  availableViews!: EditorView[];
  contentType!: EditorView;

  constructor(private settingsService: SettingsService) {}

  @HostListener('window:keydown', ['$event'])
  keyBoardListener(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.onSave();
    }
  }

  onSave(): void {
    if (this.unsavedChanges) {
      this.save();
    }
  }

  ngOnInit(): void {
    this.subscribeToEditorChanges();
    this.subscribeToSettings();
  }

  ngOnDestroy(): void {
    this.showPrettifyOnLoadSubscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readOnlyMode'] && changes['readOnlyMode'].currentValue != undefined && this.editor) {
      this.updateReadOnlyMode();
    }
  }

  updateReadOnlyMode(): void {
    this.editor.updateOptions({ readOnly: this.readOnlyMode });
  }

  subscribeToSettings(): void {
    this.showSearchWindowOnLoadSubscription = this.settingsService.showSearchWindowOnLoadObservable.subscribe(
      (value: boolean) => {
        this.showSearchWindowOnLoad = value;
      },
    );
    this.showPrettifyOnLoadSubscription = this.settingsService.prettifyOnLoadObservable.subscribe((value: boolean) => {
      this.showPrettifyOnLoad = value;
    });
  }

  subscribeToEditorChanges(): void {
    this.editorChangesSubject.pipe(debounceTime(300)).subscribe((value: string) => {
      this.checkIfTextIsPretty();
    });
  }

  initEditor(editor: any): void {
    if (editor) {
      this.editor = editor;
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
    this.currentView = value;
    if (this.currentView === 'raw') {
      this.editorContent = this.rawFile;
    } else {
      this.prettify();
    }
  }

  prettify(): void {
    if (this.editorContent && !this.isPrettified) {
      if (this.currentView === 'xml' && this.contentType === 'xml') {
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
      if (this.currentView === 'json' && this.contentType === 'json') {
        this.editorContent = JSON.stringify(JSON.parse(this.editorContent), null, this.INDENT_TWO_SPACES);
        this.isPrettified = true;
      }
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
    this.setContentType();
    this.setAvailableViews();
    if (value !== null || value !== '') {
      this.checkIfTextIsPretty();
    }
    if (this.showPrettifyOnLoad && this.isPrettifiable(this.contentType)) {
      this.onViewChange(this.contentType);
      return;
    }
    this.onViewChange('raw');
  }

  setContentType(): void {
    if (this.checkIfFileIsXml(this.rawFile)) {
      this.contentType = 'xml';
      return;
    }
    try {
      if (this.rawFile && JSON.parse(this.rawFile)) {
        this.contentType = 'json';
        return;
      }
    } catch {
      //If error occurs, rawFile is not a json file
    }
    this.contentType = 'raw';
  }

  checkIfFileIsXml(value: string): boolean {
    if (value) {
      for (let i = 0; i < value.length; i++) {
        if (value.charAt(i) === ' ' || value.charAt(i) === '\t') {
          continue;
        }
        return value.charAt(i) === '<';
      }
    }
    return false;
  }

  setValue(value: string): void {
    this.editorContent = value;
  }

  getValue(): string {
    return this.editorContent ?? '';
  }

  setAvailableViews(): void {
    const availableViews: EditorView[] = [...basicContentTypes];
    if (!availableViews.includes(this.contentType)) {
      availableViews.push(this.contentType);
    }
    this.availableViews = availableViews;
  }

  isPrettifiable(value: EditorView): boolean {
    return prettyContentTypes.includes(value as PrettyView);
  }

  isBasicView(value: EditorView): boolean {
    return basicContentTypes.includes(value as BasicView);
  }
}
