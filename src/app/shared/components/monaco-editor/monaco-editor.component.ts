/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.css'],
})
export class MonacoEditorComponent {
  @ViewChild('container') editorContainer!: ElementRef;
  codeEditorInstance!: monaco.editor.IStandaloneCodeEditor;
  codeDiffInstance!: monaco.editor.IStandaloneDiffEditor;
  @Input() comparing: boolean = false;
  @Input()
  get value() {
    return this._value;
  }
  set value(value: string) {
    this._value = value;
  }
  private _value: string = '';

  constructor() {}

  getValue(): string {
    return this.codeEditorInstance.getValue();
  }

  /**
   * Load monaco editor
   * @param message - the initial xml code to be shown
   * @param modified - other xml in case we are comparing
   */
  loadMonaco(message: string, modified: string): void {
    if (loadedMonaco) {
      loadPromise.then(() => {
        this.comparing ? this.showDifferences(message, modified) : this.initializeEditor(message);
      });
    } else {
      loadedMonaco = true;
      loadPromise = new Promise<void>((resolve: any) => {
        if (typeof (window as any).monaco === 'object') {
          resolve();
          return;
        }

        const onAmdLoader: any = () => {
          (window as any).require.config({ paths: { vs: 'assets/monaco/vs' } });
          (window as any).require(['vs/editor/editor.main'], () => {
            this.comparing ? this.initializeDifference(message, modified) : this.initializeEditor(message);
            resolve();
          });
        };

        if (!(window as any).require) {
          const loaderScript: HTMLScriptElement = document.createElement('script');
          loaderScript.type = 'text/javascript';
          loaderScript.src = 'assets/monaco/vs/loader.js';
          loaderScript.addEventListener('load', onAmdLoader);
          document.body.append(loaderScript);
        } else {
          onAmdLoader();
        }
      });
    }
  }

  /**
   * Initialize editor
   * @param message - the initial xml cod to be shown
   */
  initializeEditor(message: string): void {
    this.codeEditorInstance = monaco.editor.create(this.editorContainer.nativeElement, {
      value: message,
      readOnly: true,
      language: 'xml',
      theme: 'vs-light',
      fontSize: 12,
      minimap: {
        enabled: false,
      },
      wordWrap: 'on',
    });
  }

  initializeDifference(message: string, modified: string): void {
    this.codeDiffInstance = monaco.editor.createDiffEditor(this.editorContainer.nativeElement, {
      enableSplitViewResizing: false,
      renderSideBySide: true,
    });

    this.showDifferences(message, modified);
  }

  showDifferences(message: string, modified: string) {
    this.codeDiffInstance.setModel({
      original: monaco.editor.createModel(message),
      modified: monaco.editor.createModel(modified),
    });
  }

  enableEdit(): void {
    this.codeEditorInstance.updateOptions({
      readOnly: false,
    });
  }

  disableEdit(): void {
    this.codeEditorInstance.updateOptions({
      readOnly: true,
    });
  }
}
