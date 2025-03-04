import { Component, Input, OnInit } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportDifference } from '../../shared/interfaces/report-difference';
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
  protected editForm!: FormGroup;
  protected readonly nameKey: string & keyof Report = 'name';
  protected readonly descriptionKey: string & keyof Report = 'description';
  protected readonly pathKey: string & keyof Report = 'path';
  protected readonly transformationKey: string & keyof Report = 'transformation';
  protected readonly variablesKey: string & keyof Report = 'variablesCsv';

  ngOnInit(): void {
    if (this.report) {
      this.editForm = new FormGroup(
        {
          [this.nameKey]: new FormControl(this.report.name),
          [this.descriptionKey]: new FormControl(this.report.description),
          [this.pathKey]: new FormControl(this.report.path),
          [this.transformationKey]: new FormControl(this.report.transformation),
          [this.variablesKey]: new FormControl(this.report.variablesCsv),
        },
        { updateOn: 'change' },
      );
    }
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
      this.getDifference(this.nameKey),
      this.getDifference(this.descriptionKey),
      this.getDifference(this.pathKey),
      this.getDifference(this.transformationKey),
      this.getDifference(this.variablesKey),
    ];
  }

  getValues(): UpdateReport {
    return {
      name: this.editForm.get(this.nameKey)?.value,
      path: this.editForm.get(this.pathKey)?.value,
      description: this.editForm.get(this.descriptionKey)?.value,
      transformation: this.editForm.get(this.transformationKey)?.value,
      variables: this.editForm.get(this.variablesKey)?.value,
    };
  }
}
