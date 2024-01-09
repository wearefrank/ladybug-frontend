import {
  Component,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { CompareData } from '../compare/compare-data';

@Component({
  selector: 'app-text-compare',
  styleUrls: ['./text-compare.component.css'],
  templateUrl: './text-compare.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class TextCompareComponent implements OnInit {
  @Input() compareData!: CompareData;
  isCompared: boolean = false;

  @Output() selectedLang = 'plaintext';
  @Output() selectedTheme = 'vs';

  @Input() themes: { value: string; name: string }[] = [
    {
      value: 'vs',
      name: 'Visual Studio',
    },
    {
      value: 'vs-dark',
      name: 'Visual Studio Dark',
    },
    {
      value: 'hc-black',
      name: 'High Contrast Dark',
    },
  ];

  // input
  inputOptions = { theme: 'vs', language: 'plaintext' };
  // compare, output
  diffOptions = {
    theme: 'vs',
    language: 'plaintext',
    readOnly: true,
    renderSideBySide: true,
    automaticLayout: true,
  };
  originalModel: DiffEditorModel = {
    code: '',
    language: 'plaintext',
  };

  modifiedModel: DiffEditorModel = {
    code: '',
    language: 'plaintext',
  };

  ngOnInit(): void {
    this.onCompare();
  }

  onCompare() {
    if (this.compareData) {
      this.originalModel = Object.assign({}, this.originalModel, {
        code: this.compareData.originalReport.xml,
      });
      this.modifiedModel = Object.assign({}, this.originalModel, {
        code: this.compareData.runResultReport.xml,
      });
      this.isCompared = true;
    }
  }
}
