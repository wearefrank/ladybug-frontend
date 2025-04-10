import { Component, Input, OnInit } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportDifference } from '../../shared/interfaces/report-difference';
import DiffMatchPatch from 'diff-match-patch';
import { UpdateReport } from '../../shared/interfaces/update-report';

interface Variable {
  name: string;
  value: string;
}

const VARIABLE_NAME_PREFIX = 'variableName_';
const VARIABLE_VALUE_PREFIX = 'variableValue_';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-form.component.html',
  styleUrl: './edit-form.component.css',
})
export class EditFormComponent implements OnInit {
  @Input({ required: true }) report!: Report;
  protected editForm!: FormGroup;
  protected readonly nameKey: string & keyof Report = 'name';
  protected readonly descriptionKey: string & keyof Report = 'description';
  protected readonly pathKey: string & keyof Report = 'path';
  protected readonly transformationKey: string & keyof Report = 'transformation';
  protected readonly variablesKey: string & keyof Report = 'variables';
  protected variables: Variable[] = [];
  protected duplicateVariableNames = new Set<number>();

  ngOnInit(): void {
    if (this.report) {
      this.editForm = new FormGroup(
        {
          [this.nameKey]: new FormControl(this.report.name),
          [this.descriptionKey]: new FormControl(this.report.description),
          [this.pathKey]: new FormControl(this.report.path),
          [this.transformationKey]: new FormControl(this.report.transformation),
          [this.variablesKey]: new FormControl(this.report.variables),
        },
        { updateOn: 'change' },
      );
    }
    this.variables = this.initVariables(this.report.variables);
    this.buildVariableControls();
    this.addEmptyVariable();
  }

  getDifference(name: keyof Report): ReportDifference {
    if (name === this.variablesKey) {
      const originalVariables = this.report.variables
        ? Object.entries(this.report.variables)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n')
        : '';
      const modifiedVariables = this.variables
        .filter((variable) => variable.name)
        .map((variable, index) => {
          const currentName = this.editForm.get(VARIABLE_NAME_PREFIX + index)?.value ?? variable.name;
          const currentValue = this.editForm.get(VARIABLE_VALUE_PREFIX + index)?.value ?? variable.value;
          return `${currentName}=${currentValue}`;
        })
        .join('\n');
      const difference = new DiffMatchPatch().diff_main(originalVariables, modifiedVariables);
      return {
        name: name,
        originalValue: originalVariables,
        difference: difference,
      };
    } else {
      const originalValue =
        this.report[name] !== undefined && this.report[name] !== null ? String(this.report[name]) : '';
      const difference = new DiffMatchPatch().diff_main(originalValue, this.editForm.get(name)?.value ?? '');
      return {
        name: name,
        originalValue: originalValue,
        difference: difference,
      };
    }
  }

  getDifferences(): ReportDifference[] {
    return [
      this.getDifference(this.nameKey),
      this.getDifference(this.descriptionKey),
      this.getDifference(this.pathKey),
      this.getDifference(this.transformationKey),
      this.getDifference(this.variablesKey),
    ];
  }

  buildVariableControls(): void {
    for (const [index, variable] of this.variables.entries()) {
      this.editForm.addControl(VARIABLE_NAME_PREFIX + index, new FormControl(variable.name));
      this.editForm.addControl(VARIABLE_VALUE_PREFIX + index, new FormControl(variable.value));
    }
  }

  addEmptyVariable(): void {
    const index = this.variables.length;
    const newVariable: Variable = { name: '', value: '' };
    this.variables.push(newVariable);
    this.editForm.addControl(VARIABLE_NAME_PREFIX + index, new FormControl(''));
    this.editForm.addControl(VARIABLE_VALUE_PREFIX + index, new FormControl(''));
  }

  updateVariable(index: number): void {
    const nameControl = this.editForm.get(VARIABLE_NAME_PREFIX + index);
    const valueControl = this.editForm.get(VARIABLE_VALUE_PREFIX + index);
    if (!nameControl || !valueControl) return;

    const newName = nameControl.value;
    const newValue = valueControl.value;

    if (this.isDuplicateVariableName(newName, index)) {
      this.duplicateVariableNames.add(index);
      return;
    } else {
      this.duplicateVariableNames.delete(index);
    }

    this.variables[index].name = newName;
    this.variables[index].value = newValue;

    if (newName && newValue && index === this.variables.length - 1) {
      this.addEmptyVariable();
    }
  }

  removeVariable(index: number): void {
    this.editForm.removeControl(VARIABLE_NAME_PREFIX + index);
    this.editForm.removeControl(VARIABLE_VALUE_PREFIX + index);
    this.variables.splice(index, 1);
    this.duplicateVariableNames.delete(index);
    this.rebuildVariableControls();
  }

  rebuildVariableControls(): void {
    for (const controlKey of Object.keys(this.editForm.controls)) {
      if (controlKey.startsWith(VARIABLE_NAME_PREFIX) || controlKey.startsWith(VARIABLE_VALUE_PREFIX)) {
        this.editForm.removeControl(controlKey);
      }
    }
    this.buildVariableControls();
    if (
      this.variables.length === 0 ||
      ((this.variables.at(-1)?.name.trim().length ?? 0) > 0 && (this.variables.at(-1)?.value.trim().length ?? 0) > 0)
    ) {
      this.addEmptyVariable();
    }
  }

  isDuplicateVariableName(name: string, ignoreIndex?: number): boolean {
    return this.variables.some((v, index) => {
      if (ignoreIndex !== undefined && index === ignoreIndex) return false;
      return v.name === name && v.name !== '';
    });
  }

  getValues(): UpdateReport {
    const variables: Record<string, string> = {};
    for (const index of this.variables.keys()) {
      const nameValue = this.editForm.get(VARIABLE_NAME_PREFIX + index)?.value ?? '';
      const valueValue = this.editForm.get(VARIABLE_VALUE_PREFIX + index)?.value ?? '';
      if (nameValue && valueValue) {
        variables[nameValue] = valueValue;
      }
    }
    return {
      name: this.editForm.get(this.nameKey)?.value,
      path: this.editForm.get(this.pathKey)?.value,
      description: this.editForm.get(this.descriptionKey)?.value,
      transformation: this.editForm.get(this.transformationKey)?.value,
      variables: this.variablesToCsv(variables),
    };
  }

  variablesToCsv(variables: Record<string, string>): string {
    const keys = Object.keys(variables);
    const keysLine = keys.join(';');
    const valuesLine = keys.map((key) => variables[key]).join(';');
    return `${keysLine}\n${valuesLine}`;
  }

  initVariables(variables: Record<string, string> | null | undefined): Variable[] {
    if (!variables) return [];
    return Object.entries(variables).map(([name, value]) => ({ name, value }));
  }
}
