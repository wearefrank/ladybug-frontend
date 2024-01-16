import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-test-settings-modal',
  templateUrl: './test-settings-modal.component.html',
  styleUrls: ['./test-settings-modal.component.css'],
})
export class TestSettingsModalComponent {
  @ViewChild('modal') modal!: any;
  settingsForm = new UntypedFormGroup({
    showReportStorageIds: new UntypedFormControl(false),
    showCheckpointIds: new UntypedFormControl(false),
  });

  constructor(private modalService: NgbModal) {}

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
  }

  saveSettings(): void {
    localStorage.setItem('showReportStorageIds', this.settingsForm.get('showReportStorageIds')?.value.toString());
    localStorage.setItem('showCheckpointIds', this.settingsForm.get('showCheckpointIds')?.value.toString());
  }

  resetSettings(): void {
    this.settingsForm.get('showReportStorageIds')?.setValue(false);
    this.settingsForm.get('showCheckpointIds')?.setValue(false);
  }

  loadSettings(): void {
    if (localStorage.getItem('showReportStorageIds')) {
      this.settingsForm.get('showReportStorageIds')?.setValue(localStorage.getItem('showReportStorageIds') === 'true');
    }

    if (localStorage.getItem('showCheckpointIds')) {
      this.settingsForm.get('showCheckpointIds')?.setValue(localStorage.getItem('showCheckpointIds') === 'true');
    }
  }
}
