/// <reference path="../../../../../node_modules/monaco-editor/monaco.d.ts" />
import { Component, ElementRef, ViewChild } from '@angular/core';

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
  loading = false;
  height = 100;
  width = 100;

  constructor() {}

  getValue(): string {
    return this.codeEditorInstance.getValue();
  }

  loadMonaco(message: string): void {
    if (this.codeEditorInstance) this.codeEditorInstance.dispose();
    this.loading = true;
    setTimeout(() => {
      if (loadedMonaco) {
        loadPromise.then(() => {
          this.initializeEditor(message);
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
              this.initializeEditor(message);
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
      this.loading = false;
    }, 500);
  }

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
      wordWrap: 'wordWrapColumn',
      wordWrapColumn: 120,
    });

    let element = this.codeEditorInstance.getDomNode();
    this.width = Number.parseInt(element?.style.width!);
    this.height = this.codeEditorInstance.getModel()?.getLineCount()! * 15;
    this.codeEditorInstance.layout({ width: this.width, height: this.height });
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
