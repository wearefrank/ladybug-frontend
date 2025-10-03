import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorComponent } from '../../../monaco-editor/monaco-editor.component';
import { AngularSplitModule } from 'angular-split';
import { HttpService } from '../../../shared/services/http.service';
import { catchError, firstValueFrom, Observable, ReplaySubject, Subscription } from 'rxjs';
import { ErrorHandling } from '../../../shared/classes/error-handling.service';
import { Transformation } from '../../../shared/interfaces/transformation';

export interface Variable {
  name: string;
  value: string;
}

export interface PartialReport {
  name: string;
  description: string | null;
  path: string | null;
  // TODO: class Report defines it erroneously as a plain string.
  // Fix this error in the type system.
  transformation: string | null;
  // TODO: This is not the correct type. Fix.
  variables: string;
  xml: string;
}

const HEIGHT_OF_FIXED_SIZE_ELEMENTS = 550;
const MIN_MONACO_EDITOR_HEIGHT = 100;

@Component({
  selector: 'app-report-value',
  imports: [MonacoEditorComponent, CommonModule, FormsModule, AngularSplitModule],
  templateUrl: './report-value.component.html',
  styleUrl: './report-value.component.css',
})
export class ReportValueComponent implements OnInit, OnDestroy {
  savedChanges = output<boolean>();
  @Input({ required: true }) report$!: Observable<PartialReport | undefined>;
  editedName = '';
  editedDescription = '';
  editedPath = '';
  editedTransformation = '';
  // TODO: Use from input report when type system issue has been fixed.
  originalVariables: Variable[] = [];
  editedVariables: Variable[] = [];
  duplicateVariables: Set<number> = new Set<number>();

  protected monacoOptions: Partial<monaco.editor.IStandaloneEditorConstructionOptions> = {
    theme: 'vs-light',
    language: 'xml',
    inlineCompletionsAccessibilityVerbose: true,
    automaticLayout: true,
    padding: { bottom: 200 },
    selectOnLineNumbers: true,
    scrollBeyondLastLine: false,
  };
  protected monacoEditorInitialHeight = 0;
  protected transformationContentRequestSubject = new ReplaySubject<string>();
  protected transformationReadOnlySubject = new ReplaySubject<boolean>();
  protected reportContentRequestSubject = new ReplaySubject<string>();
  protected reportReadOnlySubject = new ReplaySubject<boolean>();
  private _height = 0;
  private report?: PartialReport;
  private http = inject(HttpService);
  private errorHandler = inject(ErrorHandling);
  private subscriptions = new Subscription();

  get height(): number {
    return this._height;
  }

  @Input() set height(theHeight: number) {
    this._height = theHeight;
    this.monacoEditorInitialHeight = this._height - HEIGHT_OF_FIXED_SIZE_ELEMENTS;
    if (this.monacoEditorInitialHeight < MIN_MONACO_EDITOR_HEIGHT) {
      this.monacoEditorInitialHeight = MIN_MONACO_EDITOR_HEIGHT;
    }
  }

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

  ngOnInit(): void {
    this.transformationReadOnlySubject.next(false);
    this.reportReadOnlySubject.next(true);
    this.subscriptions.add(
      this.report$!.subscribe((report) => {
        if (report !== undefined) {
          this.newReport(report);
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onInputChange(): void {
    this.refreshDuplicateVariables();
    this.savedChanges.emit(this.noUnsavedChanges());
  }

  onTransformationEdited(value: string): void {
    this.editedTransformation = value;
    this.onInputChange();
  }

  async copyDefaultTransformation(): Promise<void> {
    const transformationResponse: Transformation = await firstValueFrom(
      this.http.getTransformation(false).pipe(catchError(this.errorHandler.handleError())),
    );
    this.transformationContentRequestSubject.next(transformationResponse.transformation);
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
        this.refreshDuplicateVariables();
      }
    }
  }

  // For testing purposes
  setVariables(variables: Variable[]): void {
    this.originalVariables = variables;
    this.editedVariables = ReportValueComponent.calculateEditedVariables(this.originalVariables);
    this.refreshDuplicateVariables();
  }

  private newReport(report: PartialReport): void {
    this.report = report;
    this.editedName = this.report.name;
    this.editedDescription = this.getEditorTextOfNullable(this.report.description);
    this.editedPath = this.getEditorTextOfNullable(this.report.path);
    this.editedTransformation = this.getEditorTextOfNullable(this.report.transformation);
    this.originalVariables = ReportValueComponent.initVariables(report.variables);
    this.editedVariables = ReportValueComponent.calculateEditedVariables(this.originalVariables);
    this.refreshDuplicateVariables();
    this.transformationContentRequestSubject.next(this.getEditorTextOfNullable(this.report!.transformation));
    this.reportContentRequestSubject.next(this.report.xml);
    this.onInputChange();
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

  private hasNoUnsavedVariables(): boolean {
    const realVariables: Variable[] = this.getRealEditedVariables();
    if (realVariables.length !== this.originalVariables.length) {
      return false;
    }
    for (const index in this.originalVariables) {
      if (
        realVariables[index].name !== this.originalVariables[index].name ||
        realVariables[index].value !== this.originalVariables[index].value
      ) {
        return false;
      }
    }
    return true;
  }

  private getRealEditedVariables(): Variable[] {
    return this.editedVariables.filter((v) => v.name.trim().length > 0);
  }

  private getEditorTextOfNullable(transformation: string | null): string {
    if (transformation === '') {
      console.log(
        'ReportValueComponent.getEditorTextOfTransformation(): transformation should not be the empty string',
      );
    }
    return transformation === null ? '' : transformation;
  }

  private getRealEditedValueForNullable(text: string): string | null {
    return text.trim().length === 0 ? null : text.trim();
  }

  private noUnsavedChanges(): boolean {
    if (this.report === undefined) {
      return true;
    }
    const nameUnchanged = this.editedName === this.report!.name;
    const descriptionUnchanged =
      this.getRealEditedValueForNullable(this.editedDescription) === this.report!.description;
    const pathUnchanged = this.getRealEditedValueForNullable(this.editedPath) === this.report!.path;
    const transformationUnchanged =
      this.getRealEditedValueForNullable(this.editedTransformation) === this.report!.transformation;
    return (
      nameUnchanged && descriptionUnchanged && pathUnchanged && transformationUnchanged && this.hasNoUnsavedVariables()
    );
  }
}
