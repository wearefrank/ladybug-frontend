import { Component, Input, OnChanges } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReportDifference } from '../../shared/interfaces/report-difference';
// @ts-expect-error no default export
import DiffMatchPatch from 'diff-match-patch';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-form.component.html',
  styleUrl: './edit-form.component.css',
})
export class EditFormComponent implements OnChanges {
  @Input({ required: true }) report!: Report;
  editForm!: FormGroup;

  ngOnChanges(): void {
    this.editForm = new FormGroup(
      {
        name: new FormControl(this.report.name),
        description: new FormControl(this.report.description),
        path: new FormControl(this.report.path),
        transformation: new FormControl(this.report.transformation),
        variableCsv: new FormControl(this.report.variableCsv),
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
}
