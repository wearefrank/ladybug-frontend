import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as ace from 'ace-builds';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef<HTMLElement>;
  editor: any;

  constructor() {}

  ngAfterViewInit(): void {
    this.editor = ace.edit(this.editorElement.nativeElement);
    ace.config.set('basePath', AppComponent.baseUrl + '/assets/editor-min');
    this.editor.setOptions({
      wrap: 'free',
      showPrintMargin: false,
      readOnly: true,
      enableLiveAutocompletion: true,
      indentedSoftWrap: false,
      highlightActiveLine: false,
      useWrapMode: true,
      theme: 'ace/theme/chrome',
      mode: 'ace/mode/xml',
      fontSize: 13,
    });

    this.editor.execCommand('find');

    this.editor.on('change', () => {
      this.setLineHeight();
    });
  }

  setLineHeight(): void {
    this.editorElement.nativeElement.style.height = 15 * this.editor.session.getLength() + 'px';
    this.editor.resize();
  }

  setValue(value: string): void {
    this.editor.session.setValue(value);
  }

  getValue(): string {
    return this.editor.session.getValue();
  }

  enableEdit(): void {
    this.editor.setOptions({
      readOnly: false,
      highlightActiveLine: true,
    });
  }

  disableEdit(): void {
    this.editor.setOptions({
      readOnly: true,
      highlightActiveLine: false,
    });
  }
}
