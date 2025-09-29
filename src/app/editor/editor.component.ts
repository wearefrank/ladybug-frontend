/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import * as prettierPluginHtml from 'prettier/plugins/html';
import * as prettier from 'prettier';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { SettingsService } from '../shared/services/settings.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { MonacoEditorComponent } from '../monaco-editor/monaco-editor.component';

export const basicContentTypes = ['raw'] as const;
export type BasicView = (typeof basicContentTypes)[number];
export const prettyContentTypes = ['xml', 'json'] as const;
export type PrettyView = (typeof prettyContentTypes)[number];
export const editorViewsConst = [...basicContentTypes, ...prettyContentTypes] as const;
export type EditorView = (typeof editorViewsConst)[number];

interface PrettifyResult {
  text: string;
  isPrettified: boolean;
}

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
  standalone: true,
  imports: [MonacoEditorComponent, ReactiveFormsModule, FormsModule, TitleCasePipe],
})
export class EditorComponent implements OnInit, OnDestroy {
  @Input() height!: number;
  @Input() readOnlyMode = true;
  @Output() saveReportRequest = new EventEmitter<boolean>();
  @ViewChild('statusBarElement') statusBar?: ElementRef;
  unsavedChanges = false;
  options: any = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    renderFinalNewline: false,
    scrollBeyondLastLine: false,
  };
  requestedEditorContent = '';
  originalCheckpointValue?: string | null;
  isPrettified = false;
  currentView: EditorView = 'raw';
  editorChangesSubject: Subject<string> = new Subject<string>();

  //Settings attributes
  availableViews!: EditorView[];
  contentType!: EditorView;

  editorFocused = false;

  protected editorContentsSubject = new Subject<string>();
  protected editorReadOnlySubject = new Subject<boolean>();

  private actualEditorContent?: string | null;

  private readonly INDENT_TWO_SPACES: string = '  ';
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
    this.editorContentsSubject.next(this.requestedEditorContent);
    this.editorReadOnlySubject.next(this.readOnlyMode);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onFocusedChanged(focused: boolean): void {
    this.editorFocused = focused;
  }

  onSave(): void {
    if (this.unsavedChanges) {
      this.saveReportRequest.emit(true);
    }
  }

  subscribeToEditorChanges(): void {
    /*
    const editorChangesSubscription: Subscription = this.editorChangesSubject
      .pipe(debounceTime(300))
      .subscribe((value: string) => {
        this.checkIfTextIsPretty();
      });
    this.subscriptions.add(editorChangesSubscription);
    */
    const editorChangesSubscription: Subscription = this.editorChangesSubject.subscribe((value) => {
      this.actualEditorContent =
        this.requestedEditorContent !== undefined && this.requestedEditorContent !== null ? value : null;
    });
    this.subscriptions.add(editorChangesSubscription);
  }

  initEditor(): void {
    this.checkIfTextIsPretty();
  }

  checkIfTextIsPretty(): boolean {
    if (this.requestedEditorContent) {
      prettier
        .check(this.requestedEditorContent, {
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
    if (this.originalCheckpointValue !== undefined && this.originalCheckpointValue !== null) {
      if (this.currentView === 'raw') {
        this.requestedEditorContent = this.originalCheckpointValue;
        this.isPrettified = false;
      } else {
        this.prettify(this.originalCheckpointValue).then((prettifyResult) => {
          this.requestedEditorContent = prettifyResult.text;
          this.isPrettified = prettifyResult.isPrettified;
        });
      }
    }
  }

  private prettify(text: string): Promise<PrettifyResult> {
    return new Promise<PrettifyResult>((resolve) => {
      if (this.currentView === 'xml' && this.contentType === 'xml') {
        prettier
          .format(text, {
            parser: 'html',
            plugins: [prettierPluginHtml],
            bracketSameLine: true,
          })
          .then((result: string): void => {
            resolve({ text: result, isPrettified: true });
          });
      }
      if (this.currentView === 'json' && this.contentType === 'json') {
        const jsonFormatted: string = JSON.stringify(JSON.parse(text), null, this.INDENT_TWO_SPACES);
        resolve({ text: jsonFormatted, isPrettified: true });
      }
      resolve({ text, isPrettified: false });
    });
  }

  onActualEditorContentsChange(event: string): void {
    console.log(`EditorComponent.onActualEditorContentsChange(): ${event.slice(0, 20)}`);
    this.editorChangesSubject.next(event);
    this.unsavedChanges = event !== this.originalCheckpointValue;
  }

  setNewCheckpoint(value: string | null): void {
    console.log('Got checkpoint value null');
    this.originalCheckpointValue = value;
    this.setContentType();
    this.setAvailableViews();
    if (value !== undefined && value !== null && value !== '') {
      this.requestedEditorContent = value;
      this.checkIfTextIsPretty();
      this.onViewChange('raw');
    }
  }

  setContentType(): void {
    if (this.originalCheckpointValue === undefined) {
      throw new Error(
        'EditorComponent.setContentType: expected that originalCheckpointValue was set because we call this method when a new checkpoint is selected',
      );
    }
    if (this.originalCheckpointValue === null) {
      this.contentType = 'raw';
      return;
    }
    if (this.checkIfFileIsXml(this.originalCheckpointValue)) {
      this.contentType = 'xml';
      return;
    }
    try {
      if (this.originalCheckpointValue && JSON.parse(this.originalCheckpointValue)) {
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

  getValue(): string {
    return this.actualEditorContent ?? '';
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
