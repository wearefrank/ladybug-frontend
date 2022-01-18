import { Component, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';

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

  constructor(private modalService: NgbModal, private cookieService: CookieService) {}

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
  }

  saveSettings(): void {
    this.cookieService.set('showReportStorageIds', this.settingsForm.get('showReportStorageIds')?.value.toString());
    this.cookieService.set('showCheckpointIds', this.settingsForm.get('showCheckpointIds')?.value.toString());
  }

  resetSettings(): void {
    this.settingsForm.get('showReportStorageIds')?.setValue(false);
    this.settingsForm.get('showCheckpointIds')?.setValue(false);
  }

  loadSettings(): void {
    if (this.cookieService.get('showReportStorageIds')) {
      this.settingsForm.get('showReportStorageIds')?.setValue(this.cookieService.get('showReportStorageIds'));
    }

    if (this.cookieService.get('showCheckpointIds')) {
      this.settingsForm.get('showCheckpointIds')?.setValue(this.cookieService.get('showCheckpointIds'));
    }
  }
}
