import { Component, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { DiffEditorModel } from 'ngx-monaco-editor-v2';
import { CompareData } from '../compare/compare.component';

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

  @Input() languages: string[] = [
    'bat',
    'c',
    'coffeescript',
    'cpp',
    'csharp',
    'csp',
    'css',
    'dockerfile',
    'fsharp',
    'go',
    'handlebars',
    'html',
    'ini',
    'java',
    'javascript',
    'json',
    'less',
    'lua',
    'markdown',
    'msdax',
    'mysql',
    'objective-c',
    'pgsql',
    'php',
    'plaintext',
    'postiats',
    'powershell',
    'pug',
    'python',
    'r',
    'razor',
    'redis',
    'redshift',
    'ruby',
    'rust',
    'sb',
    'scss',
    'sol',
    'sql',
    'st',
    'swift',
    'typescript',
    'vb',
    'xml',
    'yaml',
  ];

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
    this.originalModel = Object.assign({}, this.originalModel, {
      code: this.compareData.originalReport.xml,
    });
    this.modifiedModel = Object.assign({}, this.originalModel, {
      code: this.compareData.runResultReport.xml,
    });
    this.isCompared = true;
  }
}
