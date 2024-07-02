import { Component, Input, OnChanges } from '@angular/core';
import { Report } from '../../shared/interfaces/report';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './edit-form.component.html',
  styleUrl: './edit-form.component.css',
})
export class EditFormComponent implements OnChanges {
  @Input({ required: true }) report!: Report;
  protected _name?: string;
  protected _description?: string;
  protected _path?: string;
  protected _transformation?: string;
  protected _variables?: string;

  ngOnChanges(): void {
    if (this.report) {
      this.initForm();
    }
  }

  initForm(): void {
    this._name = this.report.name;
    this._description = this.report.description;
    this._path = this.report.path;
    this._transformation = this.report.transformation;
    this._variables = this.report.variableCsv;
  }

  get name(): string {
    return this._name ?? '';
  }

  get description(): string {
    return this._description ?? '';
  }

  get path(): string {
    return this._path ?? '';
  }

  get transformation(): string {
    return this._transformation ?? '';
  }

  get variables(): string {
    return this._variables ?? '';
  }
}
