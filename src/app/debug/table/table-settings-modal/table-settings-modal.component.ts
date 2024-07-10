import { Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../shared/services/http.service';
import { SettingsService } from '../../../shared/services/settings.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { UploadParams } from 'src/app/shared/interfaces/upload-params';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, ToastComponent],
})
export class TableSettingsModalComponent implements OnDestroy {
  @ViewChild('modal') modal!: ElementRef;
  showMultipleAtATime: boolean = false;
  showMultipleAtATimeSubscription!: Subscription;
  tableSpacing: number = 1;
  spacingOptions: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  tableSpacingSubscription!: Subscription;
  showSearchWindowOnLoad: boolean = true;
  showSearchWindowOnLoadSubscription!: Subscription;
  prettifyOnLoad: boolean = true;
  prettifyOnLoadSubscription!: Subscription;
  settingsForm: UntypedFormGroup = new UntypedFormGroup({
    showMultipleFilesAtATime: new UntypedFormControl(this.showMultipleAtATime),
    showSearchWindowOnLoad: new UntypedFormControl(this.showSearchWindowOnLoad),
    prettifyOnLoad: new UntypedFormControl(this.prettifyOnLoad),
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
    private toastService: ToastService,
  ) {
    this.subscribeToSettingsServiceObservables();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  subscribeToSettingsServiceObservables(): void {
    this.showMultipleAtATimeSubscription = this.settingsService.showMultipleAtATimeObservable.subscribe(
      (value: boolean): void => {
        this.showMultipleAtATime = value;
        this.settingsForm.get('showMultipleFilesAtATime')?.setValue(this.showMultipleAtATime);
      },
    );
    this.tableSpacingSubscription = this.settingsService.tableSpacingObservable.subscribe((value: number): void => {
      this.tableSpacing = value;
      this.settingsForm.get('tableSpacing')?.setValue(this.tableSpacing);
    });
    this.showSearchWindowOnLoadSubscription = this.settingsService.showSearchWindowOnLoadObservable.subscribe(
      (value: boolean): void => {
        this.showSearchWindowOnLoad = value;
        this.settingsForm.get('showSearchWindowOnLoad')?.setValue(this.showSearchWindowOnLoad);
      },
    );

    this.prettifyOnLoadSubscription = this.settingsService.prettifyOnLoadObservable.subscribe((value: boolean) => {
      this.prettifyOnLoad = value;
      this.settingsForm.get('prettifyOnLoad')?.setValue(this.prettifyOnLoad);
    });
  }

  unsubscribeAll() {
    if (this.showMultipleAtATimeSubscription) {
      this.showMultipleAtATimeSubscription.unsubscribe();
    }
    if (this.tableSpacingSubscription) {
      this.tableSpacingSubscription.unsubscribe();
    }
    if (this.showSearchWindowOnLoadSubscription) {
      this.showSearchWindowOnLoadSubscription.unsubscribe();
    }
  }

  setShowMultipleAtATime(): void {
    this.settingsService.setShowMultipleAtATime(!this.showMultipleAtATime);
  }

  setShowSearchWindowOnload(): void {
    this.settingsService.setShowSearchWindowOnLoad(!this.showSearchWindowOnLoad);
  }

  onClickSave(modal: NgbActiveModal): void {
    modal.dismiss();
    this.saveSettings();
  }

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
    this.detectClosingModal();
  }

  detectClosingModal(): void {
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
    const data: UploadParams = {
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
    this.httpService
      .getTransformation(false)
      .subscribe((response) => this.settingsForm.get('transformation')?.setValue(response.transformation));
  }

  saveResponseSetting(response: any): void {
    const generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
    localStorage.setItem('generatorEnabled', generatorStatus);
    this.settingsForm.get('generatorEnabled')?.setValue(generatorStatus);
    this.settingsForm.get('regexFilter')?.setValue(response.regexFilter);
  }

  changeTableSpacing(value: any): void {
    this.settingsService.setTableSpacing(Number(value));
  }

  setPrettifyOnLoad(): void {
    this.settingsService.setPrettifyOnLoad(!this.prettifyOnLoad);
  }
}
