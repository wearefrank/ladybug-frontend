/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SettingsService } from '../shared/services/settings.service';
import { editor } from 'monaco-editor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TitleCasePipe } from '@angular/common';
import IEditor = editor.IEditor;

export const basicContentTypes = ['raw'] as const;
export type BasicView = (typeof basicContentTypes)[number];
export const prettyContentTypes = ['xml', 'json'] as const;
export type PrettyView = (typeof prettyContentTypes)[number];
export const editorViewsConst = [...basicContentTypes, ...prettyContentTypes] as const;
export type EditorView = (typeof editorViewsConst)[number];

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  standalone: true,
  imports: [MonacoEditorModule, ReactiveFormsModule, FormsModule, TitleCasePipe],
})
export class EditorComponent implements OnInit, OnDestroy, OnChanges {
  @Input() height!: number;
  @Input() readOnlyMode = true;
  @Output() saveReport: Subject<string> = new Subject<string>();
  @ViewChild('statusBarElement') statusBar?: ElementRef;
  editor!: IEditor;
  unsavedChanges = false;
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
  isPrettified = false;
  currentView: EditorView = 'raw';
  editorFocused = false;
  editorChangesSubject: Subject<string> = new Subject<string>();

  //Settings attributes
  showPrettifyOnLoad = true;
  showSearchWindowOnLoad = true;
  availableViews!: EditorView[];
  contentType!: EditorView;

  protected readonly INDENT_TWO_SPACES: string = '  ';
  protected calculatedHeight: number = this.height;
  private subscriptions: Subscription = new Subscription();

  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);

  @HostListener('window:keydown', ['$event'])
  keyBoardListener(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.onSave();
    }
  }

  ngOnInit(): void {
    this.subscribeToEditorChanges();
    this.subscribeToSettings();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['height']) {
      this.calculateHeight();
    }
    if (changes['readOnlyMode'] && changes['readOnlyMode'].currentValue != undefined && this.editor) {
      this.updateReadOnlyMode();
    }
  }

  onSave(): void {
    if (this.unsavedChanges) {
      this.save();
    }
  }

  calculateHeight(): void {
    if (this.statusBar) {
      this.calculatedHeight = this.height - this.statusBar.nativeElement.offsetHeight;
      this.cdr.detectChanges();
    }
  }

  updateReadOnlyMode(): void {
    this.editor.updateOptions({ readOnly: this.readOnlyMode });
  }

  subscribeToSettings(): void {
    const showSearchWindowOnLoad: Subscription = this.settingsService.showSearchWindowOnLoadObservable.subscribe(
      (value: boolean) => {
        this.showSearchWindowOnLoad = value;
      },
    );
    this.subscriptions.add(showSearchWindowOnLoad);
    const prettifyOnLoad: Subscription = this.settingsService.prettifyOnLoadObservable.subscribe((value: boolean) => {
      this.showPrettifyOnLoad = value;
    });
    this.subscriptions.add(prettifyOnLoad);
  }

  subscribeToEditorChanges(): void {
    const editorChangesSubscription: Subscription = this.editorChangesSubject
      .pipe(debounceTime(300))
      .subscribe((value: string) => {
        this.checkIfTextIsPretty();
      });
    this.subscriptions.add(editorChangesSubscription);
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
        this.onViewChange(this.contentType);
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
    if (this.editorContent) {
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
    this.calculateHeight();
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
      for (let index = 0; index < value.length; index++) {
        if (value.charAt(index) === ' ' || value.charAt(index) === '\t') {
          continue;
        }
        return value.charAt(index) === '<';
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
