import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorComponent } from '../../../monaco-editor/monaco-editor.component';

export interface Variable {
  name: string;
  value: string;
}

export interface PartialReport {
  name: string;
  description: string;
  path: string;
  transformation: string;
  variables: string;
  xml: string;
}

@Component({
  selector: 'app-report-value',
  imports: [MonacoEditorComponent, CommonModule, FormsModule],
  templateUrl: './report-value.component.html',
  styleUrl: './report-value.component.css',
})
export class ReportValueComponent {
  @Input() height = 0;
  editedName = '';
  editedDescription = '';
  editedPath = '';
  editedTransformation = '';
  // TODO: Use from input report when type system issue has been fixed.
  originalVariables: Variable[] = [];
  editedVariables: Variable[] = [];
  duplicateVariables: Set<number> = new Set<number>();

  private _report?: PartialReport;

  get report(): PartialReport | undefined {
    return this._report;
  }

  @Input() set report(report: PartialReport) {
    this._report = report;
    this.editedName = this._report.name;
    this.editedDescription = this._report.description;
    this.editedPath = this._report.path;
    this.editedTransformation = this._report.transformation;
    this.originalVariables = ReportValueComponent.initVariables(report.variables);
    this.editedVariables = ReportValueComponent.calculateEditedVariables(this.originalVariables);
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  protected monacoOptions: Partial<monaco.editor.IStandaloneEditorConstructionOptions> = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    scrollBeyondLastLine: false,
  };

  // TODO: Fix issue with types. Report.variables is declared to be a string,
  // but it is really an object.
  static initVariables(variables: string | null): Variable[] {
    if (!variables) return [];
    return Object.entries(variables).map(([name, value]) => ({ name, value }));
  }

  static calculateEditedVariables(originalVariables: Variable[]): Variable[] {
    const result: Variable[] = [];
    for (const original of originalVariables) {
      result.push({ name: original.name, value: original.value });
    }
    // Empty row to allow user to add new variable.
    result.push({ name: '', value: '' });
    return result;
  }

  onInputChange(): void {
    this.refreshDuplicateVariables();
  }

  removeVariable(index: number): void {
    this.editedVariables.splice(index, 1);
    this.refreshDuplicateVariables();
  }

  addEmptyVariableWhenNeeded(): void {
    if (this.editedVariables.length > 0) {
      const lastVariable: Variable = this.editedVariables.at(-1)!;
      if (lastVariable.name.length > 0) {
        this.editedVariables.push({ name: '', value: '' });
      }
    }
  }

  // For testing purposes
  setVariables(variables: Variable[]): void {
    this.originalVariables = variables;
    this.editedVariables = ReportValueComponent.calculateEditedVariables(this.originalVariables);
  }

  private refreshDuplicateVariables(): void {
    this.duplicateVariables = new Set<number>();
    const variableNames = new Set<string>();
    for (const [index, variable] of this.editedVariables.entries()) {
      if (variableNames.has(variable.name)) {
        this.duplicateVariables.add(index);
      }
      variableNames.add(variable.name);
    }
  }
}
