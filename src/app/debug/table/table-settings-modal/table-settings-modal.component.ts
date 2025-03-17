import {
  Component,
  EventEmitter,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../shared/services/http.service';
import { SettingsService } from '../../../shared/services/settings.service';
import { catchError, firstValueFrom, Subscription } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { UploadParams } from 'src/app/shared/interfaces/upload-params';
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';
import { OptionsSettings } from '../../../shared/interfaces/options-settings';
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
export class TableSettingsModalComponent implements OnDestroy {
  @Output() openLatestReportsEvent: EventEmitter<number> =
    new EventEmitter<number>();

  @ViewChild('modal') protected settingsModalElement!: TemplateRef<HTMLElement>;
  @ViewChild('unsavedChangesModal')
  protected unsavedChangesModalElement!: TemplateRef<HTMLElement>;

  protected showMultipleAtATime: boolean = false;
  protected unsavedChanges: boolean = false;

  protected backendVersion?: string;
  protected frontendVersion?: string;

  //Form Control Name keys
  protected readonly showMultipleFilesKey: string = 'showMultipleFilesAtATime';
  protected readonly showSearchWindowOnLoadKey: string =
    'showSearchWindowOnLoad';
  protected readonly prettifyOnLoadKey: string = 'prettifyOnLoad';
  protected readonly tableSpacingKey: string = 'tableSpacing';
  protected readonly generatorEnabledKey: string = 'generatorEnabled';
  protected readonly regexFilterKey: string = 'regexFilter';
  protected readonly transformationEnabledKey: string = 'transformationEnabled';
  protected readonly transformationKey: string = 'transformation';

  protected readonly defaultRegexValue: string = '.*';
  protected readonly defaultGeneratorEnabled: string = 'Enabled';

  protected readonly spacingOptions: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  protected tableSpacing: number = 1;
  protected showSearchWindowOnLoad: boolean = true;
  protected prettifyOnLoad: boolean = true;
  protected settingsForm: FormGroup = new FormGroup({
    [this.showMultipleFilesKey]: new UntypedFormControl(
      this.settingsService.defaultShowMultipleFilesAtATime,
    ),
    [this.showSearchWindowOnLoadKey]: new UntypedFormControl(
      this.settingsService.defaultShowSearchWindowOnLoad,
    ),
    [this.prettifyOnLoadKey]: new UntypedFormControl(
      this.settingsService.defaultPrettifyOnLoad,
    ),
    [this.tableSpacingKey]: new UntypedFormControl(
      this.settingsService.defaultTableSpacing,
    ),
    [this.generatorEnabledKey]: new UntypedFormControl(
      this.defaultGeneratorEnabled,
    ),
    [this.regexFilterKey]: new UntypedFormControl(this.defaultRegexValue),
    [this.transformationEnabledKey]: new UntypedFormControl(true),
    [this.transformationKey]: new UntypedFormControl(''),
  });

  private formValueOnStart: any;
  private subscriptions: Subscription = new Subscription();
  private activeSettingsModal?: NgbActiveModal;
  private activeUnsavedChangesModal?: NgbActiveModal;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private settingsService: SettingsService,
    private toastService: ToastService,
    private errorHandler: ErrorHandling,
    private versionService: VersionService,
    private debugTabService: DebugTabService,
  ) {
    this.getApplicationVersions();
    this.subscribeToSettingsServiceObservables();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getApplicationVersions() {
    this.versionService
      .getFrontendVersion()
      .then((frontendVersion: string): void => {
        this.frontendVersion = frontendVersion;
      });
    this.versionService
      .getBackendVersion()
      .then((backendVersion: string): void => {
        this.backendVersion = backendVersion;
      });
  }

  subscribeToSettingsServiceObservables(): void {
    const showMultipleSubscription: Subscription =
      this.settingsService.showMultipleAtATimeObservable.subscribe({
        next: (value: boolean): void => {
          this.showMultipleAtATime = value;
          this.settingsForm
            .get(this.showMultipleFilesKey)
            ?.setValue(this.showMultipleAtATime);
        },
      });
    this.subscriptions.add(showMultipleSubscription);
    const tableSpacingSubscription: Subscription =
      this.settingsService.tableSpacingObservable.subscribe({
        next: (value: number): void => {
          this.tableSpacing = value;
          this.settingsForm
            .get(this.tableSpacingKey)
            ?.setValue(this.tableSpacing);
        },
      });
    this.subscriptions.add(tableSpacingSubscription);
    const showSearchWindowOnLoad: Subscription =
      this.settingsService.showSearchWindowOnLoadObservable.subscribe({
        next: (value: boolean): void => {
          this.showSearchWindowOnLoad = value;
          this.settingsForm
            .get(this.showSearchWindowOnLoadKey)
            ?.setValue(this.showSearchWindowOnLoad);
        },
      });
    this.subscriptions.add(showSearchWindowOnLoad);
    const prettifyOnLoad: Subscription =
      this.settingsService.prettifyOnLoadObservable.subscribe({
        next: (value: boolean) => {
          this.prettifyOnLoad = value;
          this.settingsForm
            .get(this.prettifyOnLoadKey)
            ?.setValue(this.prettifyOnLoad);
        },
      });
    this.subscriptions.add(prettifyOnLoad);
  }

  async open(): Promise<void> {
    await this.loadSettings();
    this.activeSettingsModal = this.modalService.open(
      this.settingsModalElement,
    );
  }

  closeSettingsModal() {
    this.activeSettingsModal?.close();
    if (this.unsavedChanges) {
      this.activeUnsavedChangesModal = this.modalService.open(
        this.unsavedChangesModalElement,
        { backdrop: 'static' },
      );
    }
  }

  async loadSettings(): Promise<void> {
    const settingsResponse: OptionsSettings = await firstValueFrom(
      this.httpService
        .getSettings()
        .pipe(catchError(this.errorHandler.handleError())),
    );
    this.saveResponseSetting(settingsResponse);
    if (localStorage.getItem('transformationEnabled')) {
      this.settingsForm
        .get(this.transformationEnabledKey)
        ?.setValue(localStorage.getItem('transformationEnabled') == 'true');
    }
    this.settingsForm
      .get(this.showSearchWindowOnLoadKey)
      ?.setValue(this.showSearchWindowOnLoad);
    this.settingsForm
      .get(this.prettifyOnLoadKey)
      ?.setValue(this.prettifyOnLoad);
    this.settingsForm
      .get(this.showMultipleFilesKey)
      ?.setValue(this.showMultipleAtATime);
    const transformationResponse = await firstValueFrom(
      this.httpService
        .getTransformation(false)
        .pipe(catchError(this.errorHandler.handleError())),
    );
    this.settingsForm
      .get(this.transformationKey)
      ?.setValue(transformationResponse.transformation);
    if (!this.formValueOnStart) {
      this.formValueOnStart = this.settingsForm.value;
    }
  }

  onClickSave(): void {
    this.saveSettings();
    this.closeSettingsModal();
  }

  saveSettings(): void {
    this.saveToLocalStorage();
    const transformation = this.settingsForm.get(this.transformationKey)?.value;
    this.httpService
      .postTransformation(transformation)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe();
    const tableSpacing = this.settingsForm.get(this.tableSpacingKey);
    this.settingsService.setTableSpacing(Number(tableSpacing?.value));
    const showMultipleAtATime = this.settingsForm.get(
      this.showMultipleFilesKey,
    );
    this.settingsService.setShowMultipleAtATime(showMultipleAtATime?.value);
    const showSearchWindowOnLoad = this.settingsForm.get(
      this.showSearchWindowOnLoadKey,
    );
    this.settingsService.setShowSearchWindowOnLoad(
      showSearchWindowOnLoad?.value,
    );
    const prettifyOnLoad = this.settingsForm.get(this.prettifyOnLoadKey);
    this.settingsService.setPrettifyOnLoad(prettifyOnLoad?.value);
    const generatorEnabled: boolean =
      this.settingsForm.get(this.generatorEnabledKey)?.value === 'Enabled';
    const regexValue = this.settingsForm.get(this.regexFilterKey)?.value;
    const regexFilter = regexValue === '' ? this.defaultRegexValue : regexValue;
    const data: UploadParams = {
      generatorEnabled: generatorEnabled,
      regexFilter: regexFilter,
    };
    this.httpService
      .postSettings(data)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe(() => this.toastService.showSuccess('Settings saved!'));

    if (this.debugTabService.hasAnyReportsOpen()) {
      this.toastService.showWarning('Reopen report to see updated XML', {
        buttonText: 'Reopen',
        callback: () => this.debugTabService.refreshTree(),
      });
    }
    this.unsavedChanges = false;
    this.formValueOnStart = this.settingsForm.value;
  }

  saveToLocalStorage(): void {
    localStorage.setItem(
      'generatorEnabled',
      this.settingsForm.get(this.generatorEnabledKey)?.value,
    );
    localStorage.setItem(
      'transformationEnabled',
      this.settingsForm.get(this.transformationEnabledKey)?.value,
    );
  }

  openLatestReports(amount: number): void {
    this.openLatestReportsEvent.next(amount);
  }

  async factoryReset(): Promise<void> {
    this.settingsForm.reset();
    this.settingsService.setShowMultipleAtATime();
    this.settingsService.setTableSpacing();
    this.settingsService.setPrettifyOnLoad();
    this.settingsService.setShowSearchWindowOnLoad();
    const optionsResponse = await firstValueFrom(
      this.httpService
        .resetSettings()
        .pipe(catchError(this.errorHandler.handleError())),
    );
    this.saveResponseSetting(optionsResponse);
    const transformationResponse = await firstValueFrom(
      this.httpService
        .getTransformation(true)
        .pipe(catchError(this.errorHandler.handleError())),
    );
    this.settingsForm
      .get(this.transformationKey)
      ?.setValue(transformationResponse.transformation);
    this.saveSettings();
    this.activeSettingsModal?.close();
  }

  saveResponseSetting(response: OptionsSettings): void {
    const generatorStatus = response.generatorEnabled ? 'Enabled' : 'Disabled';
    localStorage.setItem(this.generatorEnabledKey, generatorStatus);
    this.settingsForm.get(this.generatorEnabledKey)?.setValue(generatorStatus);
    this.settingsForm.get(this.regexFilterKey)?.setValue(response.regexFilter);
  }

  protected formHasChanged(): void {
    const currentFormValue = this.settingsForm.value;
    let unsavedChanges = false;
    for (let [key, value] of Object.entries(this.formValueOnStart)) {
      if (currentFormValue[key] !== value) {
        unsavedChanges = true;
      }
    }
    this.unsavedChanges = unsavedChanges;
  }

  protected saveAndClose(): void {
    this.saveSettings();
    this.activeUnsavedChangesModal?.close();
    this.closeSettingsModal();
  }

  protected async closeWithoutSaving(): Promise<void> {
    await this.loadSettings();
    this.unsavedChanges = false;
    this.activeUnsavedChangesModal?.close();
    this.closeSettingsModal();
  }
}
