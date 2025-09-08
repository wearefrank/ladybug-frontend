// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../node_modules/monaco-editor/monaco.d.ts" />
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { first, Observable, ReplaySubject } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type AMDRequire = {
  require: {
    // eslint-disable-next-line no-unused-vars
    (imports: string[], callback: () => void): void;
    // eslint-disable-next-line no-unused-vars
    config(config: { paths: Record<string, string> }): void;
  };
};

@Component({
  selector: 'app-monaco-editor',
  imports: [],
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.scss'],
})
export class MonacoEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() height!: number;
  @Input() requestedEditorContents?: string;
  @Output() actualEditorContentsChange = new EventEmitter<string>();
  @Input() requestedReadOnly = true;
  @Output() actualReadOnlyChange = new EventEmitter<boolean>();
  @Output() focusedChange = new EventEmitter<boolean>();
  @Input() options?: Partial<monaco.editor.IStandaloneEditorConstructionOptions>;
  @Input()
  actions?: {
    ctrlEnter?: monaco.editor.IActionDescriptor;
  };
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onInit = new EventEmitter<void>();

  @ViewChild('editor')
  protected editorContainer!: ElementRef;

  editor$: Observable<monaco.editor.IStandaloneCodeEditor>;

  private editorSubject = new ReplaySubject<monaco.editor.IStandaloneCodeEditor>(1);

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private decorationsDelta: string[] = [];

  constructor() {
    this.editor$ = this.editorSubject.asObservable();
  }

  ngAfterViewInit(): void {
    console.log(`Initial height: ${this.height}`);
    // this.editorContainer.nativeElement.height = this.height;
    this.loadMonaco();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const requestedHeightChange = changes['height'];
    if (requestedHeightChange) {
      console.log(`Requested height: ${requestedHeightChange.currentValue}`);
      if (this.editorContainer) {
        console.log('editorContainer is set');
        this.editorContainer.nativeElement.height = requestedHeightChange.currentValue;
      }
    }
    const requestedEditorContentsChange = changes['requestedEditorContents'];
    if (
      requestedEditorContentsChange &&
      this.editor?.getValue() !== requestedEditorContentsChange.currentValue &&
      !requestedEditorContentsChange.isFirstChange()
    ) {
      this.setRequestedEditorContents(changes['requestedEditorContents'].currentValue);
    }
    const requestedReadOnlyChange = changes['requestedReadOnly'];
    if (requestedReadOnlyChange && !requestedReadOnlyChange.isFirstChange()) {
      this.setReadOnly(this.requestedReadOnly);
    }
  }

  ngOnDestroy(): void {
    this.editor?.dispose();
  }

  async setReadOnly(readOnly: boolean): Promise<void> {
    return new Promise<void>((resolve) => {
      this.editor$.pipe(first()).subscribe((editor) => {
        editor.updateOptions({ readOnly });
        this.actualReadOnlyChange.emit(readOnly);
        resolve();
      });
    });
  }

  async setRequestedEditorContents(content: string): Promise<void> {
    return new Promise<void>((resolve) => {
      this.editor$.pipe(first()).subscribe((editor) => {
        editor.getModel()?.setValue(content);
        resolve();
      });
    });
  }

  findMatchForRegex(regexp: string): monaco.editor.FindMatch[] | undefined {
    let matches: monaco.editor.FindMatch[] | undefined;
    this.editor$.pipe(first()).subscribe((editor) => {
      matches = editor.getModel()?.findMatches(regexp, false, true, true, null, false);
    });
    return matches;
  }

  private loadMonaco(): void {
    if (typeof globalThis.monaco === 'object') {
      this.initializeMonaco();
      return;
    }

    if ((globalThis as unknown as AMDRequire).require) {
      this.onAmdLoader();
    } else {
      const loaderScript: HTMLScriptElement = document.createElement('script');
      loaderScript.type = 'text/javascript';
      loaderScript.src = 'assets/monaco/vs/loader.js';
      loaderScript.addEventListener('load', () => this.onAmdLoader());
      document.body.append(loaderScript);
    }
  }

  private onAmdLoader(): void {
    const windowRequire = (globalThis as unknown as AMDRequire).require;
    windowRequire.config({ paths: { vs: 'assets/monaco/vs' } });
    windowRequire(['vs/editor/editor.main'], () => {
      this.initializeMonaco();
    });
  }

  private initializeMonaco(): void {
    this.initializeEditor();
    this.initializeEvents();
    this.initializeActions();
    this.initializeMouseEvents();
    this.onInit.emit();
  }

  private initializeEditor(): void {
    if (this.options?.readOnly !== undefined) {
      throw new Error('MonacoEditorComponent.options should not include readOnly. Use input requestedReadOnly instead');
    }
    this.editor = monaco.editor.create(this.editorContainer.nativeElement, {
      value: this.requestedEditorContents,
      readOnly: this.requestedReadOnly,
      dimension: {
        width: 500,
        height: this.height,
      },
      theme: 'vs-light',
      language: 'xml',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      minimap: { enabled: false },
      ...this.options,
    });
    this.editorSubject.next(this.editor);
  }

  private initializeEvents(): void {
    this.editor$.pipe(first()).subscribe((editor) => {
      editor.onDidChangeModelContent(() => {
        this.actualEditorContentsChange.emit(editor.getValue());
      });
      editor.onDidFocusEditorWidget((): void => {
        this.focusedChange.emit(true);
      });
      editor.onDidBlurEditorWidget((): void => {
        this.focusedChange.emit(false);
      });
    });
  }

  private initializeActions(): void {
    const actionKeyBindings: Record<string, number[]> = {
      ctrlEnter: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
    };
    this.editor$.pipe(first()).subscribe((editor) => {
      for (const [action, descriptor] of Object.entries(this.actions || {})) {
        editor.addAction({
          id: descriptor.id,
          label: descriptor.label,
          keybindings: actionKeyBindings[action],
          run: descriptor.run,
        });
      }
    });
  }

  private initializeMouseEvents(): void {
    this.editor?.onMouseDown((event) => {
      const element = event.target.element;
      switch (element?.className) {
        case 'line-numbers': {
          this.handleLineNumberClick(+(element.textContent || 0));
          break;
        }
        default: {
          return;
        }
      }
    });
  }

  private handleLineNumberClick(lineNumber: number): void {
    if (lineNumber) {
      this.highlightLine(lineNumber);
      this.setPosition(lineNumber);
    }
  }

  private highlightLine(lineNumber: number): void {
    this.highlightRange({
      startLineNumber: lineNumber,
      startColumn: 0,
      endLineNumber: lineNumber,
      endColumn: 0,
    });
  }

  private highlightRange(range: monaco.IRange): void {
    this.editor$.pipe(first()).subscribe((editor) => {
      this.decorationsDelta =
        editor.getModel()?.deltaDecorations(this.decorationsDelta, [
          {
            range: range,
            options: {
              isWholeLine: true,
              overviewRuler: {
                position: monaco.editor.OverviewRulerLane.Full,
                color: '#fdc300',
              },
              className: 'monaco-editor__line--highlighted',
            },
          },
        ]) ?? [];
    });
  }

  private setPosition(lineNumber: number, column = 0): void {
    this.editor$.pipe(first()).subscribe((editor) => {
      editor.setPosition({ lineNumber: lineNumber, column: column });
    });
  }
}
