import { Component, Input, OnInit } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportDifference } from '../../shared/interfaces/report-difference';
// @ts-expect-error no default export
import DiffMatchPatch from 'diff-match-patch';
import { UpdateReport } from '../../shared/interfaces/update-report';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-form.component.html',
  styleUrl: './edit-form.component.css',
})
export class EditFormComponent implements OnInit {
  @Input({ required: true }) report!: Report;
  editForm!: FormGroup;
  nameKey: string = 'name';
  descriptionKey: string = 'description';
  pathKey: string = 'path';
  transformationKey: string = 'transformation';
  variableKey: string = 'variableCsv';

  ngOnInit(): void {
    this.editForm = new FormGroup(
      {
        [this.nameKey]: new FormControl(this.report.name),
        [this.descriptionKey]: new FormControl(this.report.description),
        [this.pathKey]: new FormControl(this.report.path),
        [this.transformationKey]: new FormControl(this.report.transformation),
        [this.variableKey]: new FormControl(this.report.variableCsv),
      },
      { updateOn: 'change' },
    );
  }

  getDifference(name: keyof Report): ReportDifference {
    const originalValue = this.report[name] ?? '';
    const difference = new DiffMatchPatch().diff_main(originalValue, this.editForm.get(name)?.value ?? '');
    return {
      name: name,
      originalValue: originalValue,
      difference: difference,
    };
  }

  getDifferences(): ReportDifference[] {
    return [
      this.getDifference(this.nameKey as keyof Report),
      this.getDifference(this.descriptionKey as keyof Report),
      this.getDifference(this.pathKey as keyof Report),
      this.getDifference(this.transformationKey as keyof Report),
      this.getDifference(this.variableKey as keyof Report),
    ];
  }

  getValues(): UpdateReport {
    return {
      name: this.editForm.get(this.nameKey)?.value,
      path: this.editForm.get(this.pathKey)?.value,
      description: this.editForm.get(this.descriptionKey)?.value,
      transformation: this.editForm.get(this.transformationKey)?.value,
      variables: this.editForm.get(this.variableKey)?.value,
    };
  }
}
