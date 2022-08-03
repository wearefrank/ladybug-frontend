import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../shared/services/http.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
})
export class TableSettingsModalComponent {
  @ViewChild('modal') modal!: ElementRef;
  settingsForm = new FormGroup({
    generatorEnabled: new FormControl('Enabled'),
    transformationEnabled: new FormControl(true),
    transformation: new FormControl(''),
  });

  @Output() openLatestReportsEvent = new EventEmitter<any>();
  @ViewChild(ToastComponent) toastComponent!: ToastComponent;
  saving: boolean = false;

  constructor(private modalService: NgbModal, private httpService: HttpService, private cookieService: CookieService) {}

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
    this.detectClosingModal();
  }

  detectClosingModal() {
    setTimeout(() => {
      if (!this.modalService.hasOpenModals()) {
        if (!this.saving) this.loadSettings();
        this.saving = false;
      } else {
        this.detectClosingModal();
      }
    }, 500);
  }

  saveSettings(): void {
    const form: any = this.settingsForm.value;
    this.cookieService.set('generatorEnabled', form.generatorEnabled);
    this.cookieService.set('transformationEnabled', form.transformationEnabled.toString());
    this.httpService.postTransformation(form.transformation).subscribe();

    let data: any = { generatorEnabled: form.generatorEnabled === 'Enabled' };
    this.httpService.postSettings(data).subscribe();

    this.toastComponent.addAlert({ type: 'warning', message: 'Reopen report to see updated XML' });
    this.saving = true;
  }

  openLatestReports(amount: number): void {
    this.openLatestReportsEvent.next(amount);
  }

  factoryReset(): void {
    this.settingsForm.get('generatorEnabled')?.setValue('Enabled');
    this.settingsForm.get('regexFilter')?.setValue('.*');
    this.settingsForm.get('transformationEnabled')?.setValue(false);
    this.httpService.getTransformation(true).subscribe((response) => {
      this.settingsForm.get('transformation')?.setValue(response.transformation);
    });
  }

  loadSettings(): void {
    this.httpService.getSettings().subscribe((response) => {
      const generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
      this.cookieService.set('generatorEnabled', generatorStatus);
      this.settingsForm.get('generatorEnabled')?.setValue(generatorStatus);
    });

    if (this.cookieService.get('regexFilter')) {
      this.settingsForm.get('regexFilter')?.setValue(this.cookieService.get('regexFilter'));
    }

    if (this.cookieService.get('transformationEnabled') != undefined) {
      this.settingsForm
        .get('transformationEnabled')
        ?.setValue(this.cookieService.get('transformationEnabled') == 'true');
    }

    this.httpService.getTransformation(false).subscribe((response) => {
      this.settingsForm.get('transformation')?.setValue(response.transformation);
    });
  }
}
