import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../shared/services/http.service';
import { SettingsService } from '../../../shared/services/settings.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
})
export class TableSettingsModalComponent implements OnDestroy {
  @ViewChild('modal') modal!: ElementRef;
  showMultipleAtATime!: boolean;
  showMultipleAtATimeSubscription!: Subscription;
  tableSpacing: number = 1;
  spacingOptions: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  tableSpacingSubscription!: Subscription;
  settingsForm: UntypedFormGroup = new UntypedFormGroup({
    showMultipleFilesAtATime: new UntypedFormControl(false),
    tableSpacing: new UntypedFormControl(this.tableSpacing),
    generatorEnabled: new UntypedFormControl('Enabled'),
    regexFilter: new UntypedFormControl(''),
    transformationEnabled: new UntypedFormControl(true),
    transformation: new UntypedFormControl(''),
  });
  @Output() openLatestReportsEvent = new EventEmitter<any>();
  saving: boolean = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private settingsService: SettingsService,
    private toastService: ToastService
  ) {
    this.subscribeToSettingsServiceObservables();
  }

  ngOnDestroy() {
    this.showMultipleAtATimeSubscription.unsubscribe();
    this.tableSpacingSubscription.unsubscribe();
  }

  subscribeToSettingsServiceObservables(): void {
    this.showMultipleAtATimeSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe(
      (value: boolean) => {
        this.showMultipleAtATime = value;
        this.settingsForm.get('showMultipleFilesAtATime')?.setValue(this.showMultipleAtATime);
      }
    );
    this.tableSpacingSubscription = this.settingsService.tableSpacingObservable.subscribe((value: number) => {
      this.tableSpacing = value;
      this.settingsForm.get('tableSpacing')?.setValue(this.tableSpacing);
    });
  }

  setShowMultipleAtATime() {
    this.settingsService.setShowMultipleAtATime(!this.showMultipleAtATime);
  }

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
    this.detectClosingModal();
  }

  detectClosingModal() {
    setTimeout(() => {
      if (this.modalService.hasOpenModals()) {
        this.detectClosingModal();
      } else {
        if (!this.saving) this.loadSettings();
        this.saving = false;
      }
    }, 500);
  }

  saveSettings(): void {
    const form: any = this.settingsForm.value;
    localStorage.setItem('generatorEnabled', form.generatorEnabled);
    localStorage.setItem('transformationEnabled', form.transformationEnabled.toString());
    this.httpService.postTransformation(form.transformation).subscribe();
    const generatorEnabled: string = String(form.generatorEnabled === 'Enabled');
    let data: any = {
      generatorEnabled: generatorEnabled,
      regexFilter: form.regexFilter,
    };
    this.httpService.postSettings(data).subscribe();

    this.toastService.showWarning('Reopen report to see updated XML');
    this.saving = true;
  }

  openLatestReports(amount: number): void {
    this.openLatestReportsEvent.next(amount);
  }

  factoryReset(): void {
    this.settingsForm.reset();
    this.settingsService.setShowMultipleAtATime();
    this.httpService.resetSettings().subscribe((response) => this.saveResponseSetting(response));
    this.httpService.getTransformation(true).subscribe((resp) => {
      this.settingsForm.get('transformation')?.setValue(resp.transformation);
    });
  }

  loadSettings(): void {
    this.httpService.getSettings().subscribe((response) => this.saveResponseSetting(response));
    if (localStorage.getItem('transformationEnabled')) {
      this.settingsForm.get('transformationEnabled')?.setValue(localStorage.getItem('transformationEnabled') == 'true');
    }

    this.httpService.getTransformation(false).subscribe((response) => {
      this.settingsForm.get('transformation')?.setValue(response.transformation);
    });
  }

  saveResponseSetting(response: any) {
    const generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
    localStorage.setItem('generatorEnabled', generatorStatus);
    this.settingsForm.get('generatorEnabled')?.setValue(generatorStatus);
    this.settingsForm.get('regexFilter')?.setValue(response.regexFilter);
  }

  changeTableSpacing(value: any): void {
    this.settingsService.setTableSpacing(Number(value));
  }
}
