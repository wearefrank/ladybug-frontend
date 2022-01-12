import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
})
export class TableSettingsModalComponent {
  @ViewChild('modal') modal!: any;
  settingsForm = new FormGroup({
    generatorEnabled: new FormControl(''),
    regexFilter: new FormControl(''), // Report filter
    transformationEnabled: new FormControl(false),
    transformation: new FormControl(''),
  });

  @Output() openLatestReportsEvent = new EventEmitter<any>();

  constructor(private modalService: NgbModal, private httpService: HttpService) {}

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
  }

  /**
   * Save the settings of the table
   */
  saveSettings(): void {
    const form: any = this.settingsForm.value;
    this.httpService.setTransformationEnabled(form.transformationEnabled);
    let map: { generatorEnabled: string; regexFilter: string; transformationEnabled: string } = {
      generatorEnabled: (form.generatorEnabled === 'Enabled').toString(),
      regexFilter: form.regexFilter,
      transformationEnabled: form.transformationEnabled,
    };
    this.httpService.postSettings(map).subscribe();

    if (form.transformationEnabled) {
      let transformation = { transformation: form.transformation };
      this.httpService.postTransformation(transformation).subscribe();
    }
  }

  openLatestReports(amount: number): void {
    this.openLatestReportsEvent.next(amount);
  }

  resetModal(): void {
    this.loadSettings();
  }

  loadSettings() {
    this.httpService.getTransformation().subscribe((response) => {
      this.settingsForm.get('transformation')?.setValue(response.transformation);
    });

    this.httpService.getSettings().subscribe((response) => {
      this.settingsForm.get('generatorEnabled')?.setValue(response.generatorEnabled ? 'Enabled' : 'Disabled');
      this.settingsForm.get('regexFilter')?.setValue(response.regexFilter);
      this.settingsForm.get('transformationEnabled')?.setValue(response.transformationEnabled);
    });
  }
}
