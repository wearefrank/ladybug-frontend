import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as ace from 'ace-builds';
import { AppComponent } from '../../../app.component';
import { SettingsService } from '../../services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit, AfterViewInit {
  @ViewChild('editor') editorElement!: ElementRef<HTMLElement>;
  editor: any;
  showSearchWindowOnLoad: boolean = true;
  showSearchWindowOnLoadSubscription!: Subscription;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.subscribeToSettings();
  }

  ngAfterViewInit(): void {
    this.editor = ace.edit(this.editorElement.nativeElement);
    console.log(ace.config.get('basePath'));
    ace.config.set('basePath', 'assets/editor-min');
    console.log(ace.config.get('basePath'));
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
    if (this.showSearchWindowOnLoad) {
      this.editor.execCommand('find');
    }

    this.editor.on('change', () => {
      this.setLineHeight();
    });
  }

  subscribeToSettings(): void {
    this.showSearchWindowOnLoadSubscription = this.settingsService.showSearchWindowOnLoadObservable.subscribe(
      (value: boolean) => {
        this.showSearchWindowOnLoad = value;
      }
    );
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
