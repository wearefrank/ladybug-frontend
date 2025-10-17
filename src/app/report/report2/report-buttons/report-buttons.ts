import { Component, inject, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { StubStrategy } from '../../../shared/enums/stub-strategy';
import { FormsModule } from '@angular/forms';
import { TestResult } from '../../../shared/interfaces/test-result';
import { AppVariablesService } from '../../../shared/services/app.variables.service';
import {
  NgbDropdown,
  NgbDropdownButtonItem,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';

export interface ReportButtonsState {
  isReport: boolean;
  isCheckpoint: boolean;
  isEdited: boolean;
  saveAllowed: boolean;
  isReadOnly: boolean;
}

export type ButtonCommand = 'close' | 'makeNull' | 'save' | 'copyReport' | 'rerun' | 'customReportAction';

export interface DownloadOptions {
  downloadReport: boolean;
  downloadXmlSummary: boolean;
}

@Component({
  selector: 'app-report-buttons',
  imports: [FormsModule, NgbDropdown, NgbDropdownButtonItem, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle],
  templateUrl: './report-buttons.html',
  styleUrl: './report-buttons.css',
})
export class ReportButtons implements OnInit, OnDestroy {
  reportCommand = output<ButtonCommand>();
  checkpointStubStrategyChange = output<number>();
  reportStubStrategyChange = output<string>();
  downloadRequest = output<DownloadOptions>();
  @Input({ required: true }) state$!: Observable<ReportButtonsState>;
  @Input() originalCheckpointStubStrategy$?: Observable<number | undefined>;
  @Input({ required: true }) originalReportStubStrategy$!: Observable<string | undefined>;
  @Input({ required: true }) rerunResult$!: Observable<TestResult | undefined>;

  protected state: ReportButtonsState = {
    isReport: false,
    isCheckpoint: false,
    isEdited: false,
    saveAllowed: false,
    isReadOnly: true,
  };

  protected readonly StubStrategy = StubStrategy;
  protected currentCheckpointStubStrategyStr?: string;
  protected currentReportStubStrategy?: string;
  protected rerunResult?: TestResult;
  protected appVariablesService = inject(AppVariablesService);
  private ngZone = inject(NgZone);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.state$.subscribe(this.updateState.bind(this)));
    this.subscriptions.add(
      this.originalCheckpointStubStrategy$?.subscribe((checkpointStubStrategy) => {
        if (checkpointStubStrategy !== undefined) {
          // Martijn did not get the dropdown to work when it was filled with number values that
          // had to be shown as strings. The dropdown only deals with string representations.
          this.currentCheckpointStubStrategyStr =
            StubStrategy.checkpoints[StubStrategy.checkpointStubToIndex(checkpointStubStrategy)];
        }
      }),
    );
    this.subscriptions.add(
      this.originalReportStubStrategy$.subscribe((reportStubStrategy) => {
        if (reportStubStrategy !== undefined) {
          this.currentReportStubStrategy = reportStubStrategy;
        }
      }),
    );
    this.subscriptions.add(
      this.rerunResult$.subscribe((rerunResult) => {
        this.ngZone.run(() => (this.rerunResult = rerunResult));
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  close(): void {
    this.reportCommand.emit('close');
  }

  protected makeNull(): void {
    this.reportCommand.emit('makeNull');
  }

  protected save(): void {
    this.reportCommand.emit('save');
  }

  protected copyReport(): void {
    this.reportCommand.emit('copyReport');
  }

  protected rerun(): void {
    this.reportCommand.emit('rerun');
  }

  protected processCustomReportAction(): void {
    this.reportCommand.emit('customReportAction');
  }

  protected onCheckpointStubStrategyChange(stubStrategyString: string): void {
    const options: string[] = [...StubStrategy.checkpoints];
    const index: number = options.indexOf(stubStrategyString);
    if (index === -1) {
      throw new Error(`ReportButtons.onCheckpointStubStrategyChange(): Unknown valu ${stubStrategyString}`);
    }
    this.checkpointStubStrategyChange.emit(StubStrategy.checkpointIndex2Stub(index));
  }

  protected onReportStubStrategyChange(reportStubStrategy: string): void {
    this.reportStubStrategyChange.emit(reportStubStrategy);
  }

  protected onDownload(downloadOptions: DownloadOptions): void {
    this.downloadRequest.emit(downloadOptions);
  }

  protected getReadOnly(): string {
    return this.state.isReadOnly ? ' (read only)' : '';
  }

  private updateState(state: ReportButtonsState): void {
    this.ngZone.run(() => {
      this.state = state;
    });
  }
}
