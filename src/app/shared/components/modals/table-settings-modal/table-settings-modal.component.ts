import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
})
export class TableSettingsModalComponent {
  @ViewChild('modal') modal!: any;
  settingsForm = new FormGroup({
    generatorEnabled: new FormControl('Enabled'),
    regexFilter: new FormControl('.*'), // Report filter
    transformationEnabled: new FormControl(false),
    transformation: new FormControl(''),
  });

  @Output() openLatestReportsEvent = new EventEmitter<any>();
  @Output() openReportInProgress = new EventEmitter<any>();
  @Input()
  get reportsInProgress(): string {
    return this._reportsInProgress;
  }
  set reportsInProgress(reportsInProgress: string) {
    this._reportsInProgress = reportsInProgress;
  }
  public _reportsInProgress = '';

  constructor(private modalService: NgbModal, private httpService: HttpService, private cookieService: CookieService) {}

  open(): void {
    this.loadSettings();
    this.modalService.open(this.modal);
  }

  /**
   * Save the settings of the table
   */
  saveSettings(): void {
    const form: any = this.settingsForm.value;
    this.cookieService.set('generatorEnabled', form.generatorEnabled);
    this.cookieService.set('regexFilter', form.regexFilter);
    this.cookieService.set('transformationEnabled', form.transformationEnabled.toString());
    this.cookieService.set('transformation', form.transformation);
    this.httpService.postTransformation(form.transformation).subscribe();
  }

  openLatestReports(amount: number): void {
    this.openLatestReportsEvent.next(amount);
  }

  openReportsInProgress(index: number) {
    this.openReportInProgress.next(index);
  }

  resetModal(): void {
    this.loadSettings();
  }

  factoryReset(): void {
    this.settingsForm.get('generatorEnabled')?.setValue('Enabled');
    this.settingsForm.get('regexFilter')?.setValue('.*');
    this.settingsForm.get('transformationEnabled')?.setValue(false);
    fetch('assets/defaultTransformation.xslt')
      .then((response) => response.text())
      .then((transformation) => this.settingsForm.get('transformation')?.setValue(transformation));
  }

  loadSettings(): void {
    if (this.cookieService.get('generatorEnabled')) {
      this.settingsForm.get('generatorEnabled')?.setValue(this.cookieService.get('generatorEnabled'));
    }

    if (this.cookieService.get('regexFilter')) {
      this.settingsForm.get('regexFilter')?.setValue(this.cookieService.get('regexFilter'));
    }

    if (this.cookieService.get('transformationEnabled') != undefined) {
      this.settingsForm
        .get('transformationEnabled')
        ?.setValue(this.cookieService.get('transformationEnabled') == 'true');
    }

    if (this.cookieService.get('transformation')) {
      this.settingsForm.get('transformation')?.setValue(this.cookieService.get('transformation'));
    } else {
      this.httpService.getTransformation().subscribe((response) => {
        this.settingsForm.get('transformation')?.setValue(response.transformation);
        this.cookieService.set('transformation', response.transformation);
      });
    }
  }

  getRegexFilter(): string {
    return this.settingsForm.get('regexFilter')?.value;
  }
}
