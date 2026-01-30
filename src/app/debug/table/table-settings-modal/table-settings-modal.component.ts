/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, inject, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FrankAppSettings, SettingsService } from '../../../shared/services/settings.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';
import { VersionService } from '../../../shared/services/version.service';
import { CopyTooltipDirective } from '../../../shared/directives/copy-tooltip.directive';
import { DebugTabService } from '../../debug-tab.service';

@Component({
  selector: 'app-table-settings-modal',
  templateUrl: './table-settings-modal.component.html',
  styleUrls: ['./table-settings-modal.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CopyTooltipDirective],
})
export class TableSettingsModalComponent implements OnInit, OnDestroy {
  @Output() openLatestReportsEvent: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild('modal') protected settingsModalElement!: TemplateRef<HTMLElement>;
  @ViewChild('unsavedChangesModal')
  protected unsavedChangesModalElement!: TemplateRef<HTMLElement>;

  // Cannot be defined after protected members because they
  // are used to initialize the protected members.
  private modalService = inject(NgbModal);
  public settingsService = inject(SettingsService);
  private toastService = inject(ToastService);
  private errorHandler = inject(ErrorHandling);
  private versionService = inject(VersionService);
  private debugTabService = inject(DebugTabService);

  protected unsavedChanges = false;

  protected backendVersion?: string;
  protected frontendVersion?: string;

  //Form Control Name keys
  protected readonly showMultipleFilesKey: string = 'showMultipleFilesAtATime';
  protected readonly tableSpacingKey: string = 'tableSpacing';
  protected readonly amountOfRecordsShownKey: string = 'amountOfRecordsShown';
  protected readonly generatorEnabledKey: string = 'generatorEnabled';
  protected readonly regexFilterKey: string = 'regexFilter';
  protected readonly transformationKey: string = 'transformation';

  protected readonly spacingOptions: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  protected readonly SERVER = 'Server';
  protected readonly CLIENT = 'Client';

  protected settingsForm: FormGroup = new FormGroup({
    [this.showMultipleFilesKey]: new FormControl(false),
    [this.tableSpacingKey]: new FormControl(0),
    [this.amountOfRecordsShownKey]: new FormControl(0),
    [this.generatorEnabledKey]: new FormControl(false),
    [this.regexFilterKey]: new FormControl(''),
    [this.transformationKey]: new FormControl(''),
  });

  private subscriptions: Subscription = new Subscription();
  private activeSettingsModal?: NgbActiveModal;
  private activeUnsavedChangesModal?: NgbActiveModal;

  protected activeTab: string = this.SERVER;

  constructor() {
    this.getApplicationVersions();
  }

  ngOnInit(): void {
    this.settingsService.init().then(() => this.loadSettings());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getApplicationVersions(): void {
    this.versionService.getFrontendVersion().then((frontendVersion: string): void => {
      this.frontendVersion = frontendVersion;
    });
    this.versionService.getBackendVersion().then((backendVersion: string): void => {
      this.backendVersion = backendVersion;
    });
  }

  async open(): Promise<void> {
    await this.loadSettings();
    this.activeSettingsModal = this.modalService.open(this.settingsModalElement);
  }

  closeSettingsModal(): void {
    console.log(
      `Closing debug settings modal with unsavedChanges=${this.unsavedChanges} and table spacing ${this.settingsForm.value[this.tableSpacingKey]}`,
    );
    if (this.unsavedChanges) {
      this.activeUnsavedChangesModal = this.modalService.open(this.unsavedChangesModalElement, { backdrop: 'static' });
    } else {
      this.activeSettingsModal?.close();
    }
  }

  async loadSettings(): Promise<void> {
    this.settingsForm.get(this.showMultipleFilesKey)?.setValue(this.settingsService.isShowMultipleReportsAtATime());
    this.settingsForm.get(this.tableSpacingKey)?.setValue(this.settingsService.getTableSpacing());
    this.settingsForm.get(this.amountOfRecordsShownKey)?.setValue(this.settingsService.getAmountOfRecordsInTable());
    this.settingsForm.get(this.generatorEnabledKey)?.setValue(this.settingsService.isGeneratorEnabled());
    this.settingsForm.get(this.regexFilterKey)?.setValue(this.settingsService.getRegexFilter());
    this.settingsForm.get(this.transformationKey)?.setValue(this.settingsService.getTransformation());
    this.unsavedChanges = false;
  }

  onClickSave(): void {
    this.saveSettings().then(() => this.closeSettingsModal());
  }

  // TODO: How to do error handling here?
  saveSettings(): Promise<void> {
    return new Promise((resolve) => {
      this.settingsService.setShowMultipleReportsatATime(this.settingsForm.value[this.showMultipleFilesKey]);
      this.settingsService.setAmountOfRecordsInTable(this.settingsForm.value[this.amountOfRecordsShownKey]);
      this.settingsService.setTableSpacing(this.settingsForm.value[this.tableSpacingKey]);
      if (this.formServerSettingsChanged()) {
        const body: FrankAppSettings = {
          isGeneratorEnabled: this.getFormGeneratorEnabled(),
          regexFilter: this.settingsForm.value[this.regexFilterKey],
          transformation: this.settingsForm.value[this.transformationKey],
        };
        this.settingsService
          .saveFrankAppSettings(body)
          .then(() => this.loadSettings())
          .then(() => resolve());
      } else {
        this.loadSettings().then(() => resolve());
      }
    });
  }

  // TODO: Error handling?
  async factoryReset(): Promise<void> {
    await this.settingsService.allBackToFactory();
    await this.loadSettings();
    this.closeSettingsModal();
  }

  protected formHasChanged(): void {
    const formMultipleFilesEnabled: boolean | null = this.settingsForm.value[this.showMultipleFilesKey];
    const formTableSpacing: number | null = this.settingsForm.value[this.tableSpacingKey];
    const formAmountOfRecordsShown: number | null = this.settingsForm.value[this.amountOfRecordsShownKey];
    this.unsavedChanges =
      this.formServerSettingsChanged() ||
      formMultipleFilesEnabled !== this.settingsService.isShowMultipleReportsAtATime() ||
      formTableSpacing !== this.settingsService.getTableSpacing() ||
      formAmountOfRecordsShown !== this.settingsService.getAmountOfRecordsInTable();
    console.log(`Finishing formHasChanged() with unsaved changes=${this.unsavedChanges}`);
  }

  protected formServerSettingsChanged(): boolean {
    const formRegexFilter: string | null = this.settingsForm.value[this.regexFilterKey];
    const formTransformation: string | null = this.settingsForm.value[this.transformationKey];
    return (
      this.getFormGeneratorEnabled() !== this.settingsService.isGeneratorEnabled() ||
      formRegexFilter !== this.settingsService.getRegexFilter() ||
      formTransformation !== this.settingsService.getTransformation()
    );
  }

  private getFormGeneratorEnabled(): boolean {
    const formReportGeneratorEnabledString: string | null = this.settingsForm.value[this.generatorEnabledKey];
    return formReportGeneratorEnabledString === 'true';
  }

  protected saveAndClose(): void {
    this.saveSettings();
    this.activeUnsavedChangesModal?.close();
    this.closeSettingsModal();
  }

  protected async closeWithoutSaving(): Promise<void> {
    await this.loadSettings();
    this.activeUnsavedChangesModal?.close();
    this.closeSettingsModal();
  }

  getNavClasses(tab: string): string[] {
    const result = ['nav-link'];
    if (tab === this.activeTab) {
      result.push('active');
    }
    return result;
  }

  selectNav(tab: string): void {
    this.activeTab = tab;
  }
}
