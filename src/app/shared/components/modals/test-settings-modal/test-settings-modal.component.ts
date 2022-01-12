import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';
import { TestSettings } from '../../../interfaces/test-settings';

@Component({
  selector: 'app-test-settings-modal',
  templateUrl: './test-settings-modal.component.html',
  styleUrls: ['./test-settings-modal.component.css'],
})
export class TestSettingsModalComponent {
  @ViewChild('modal') modal!: any;
  settingsForm = new FormGroup({
    showReportStorageIds: new FormControl(false),
    showCheckpointIds: new FormControl(false),
  });
  @Output() saveSettingsEvent = new EventEmitter<any>();

  constructor(private modalService: NgbModal) {}

  open(): void {
    this.modalService.open(this.modal);
  }

  saveSettings(): void {
    const settings: TestSettings = {
      showReportStorageIds: this.settingsForm.get('showReportStorageIds')?.value,
      showCheckpointIds: this.settingsForm.get('showCheckpointIds')?.value,
    };
    this.saveSettingsEvent.next(settings);
  }

  resetSettings(): void {
    this.settingsForm.get('showReportStorageIds')?.setValue(false);
    this.settingsForm.get('showCheckpointIds')?.setValue(false);
  }
}
