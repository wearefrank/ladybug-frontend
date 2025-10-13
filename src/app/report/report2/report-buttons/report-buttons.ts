import { Component, inject, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { StubStrategy } from '../../../shared/enums/stub-strategy';
import { FormsModule } from '@angular/forms';
import { TestResult } from '../../../shared/interfaces/test-result';

export interface ReportButtonsState {
  isReport: boolean;
  isCheckpoint: boolean;
  isEdited: boolean;
  saveAllowed: boolean;
  isReadOnly: boolean;
}

export type ButtonCommand = 'close' | 'makeNull' | 'save' | 'copyReport' | 'rerun';

@Component({
  selector: 'app-report-buttons',
  imports: [FormsModule],
  templateUrl: './report-buttons.html',
  styleUrl: './report-buttons.css',
})
export class ReportButtons implements OnInit, OnDestroy {
  reportCommand = output<ButtonCommand>();
  checkpointStubStrategyChange = output<number>();
  reportStubStrategyChange = output<string>();
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

  makeNull(): void {
    this.reportCommand.emit('makeNull');
  }

  save(): void {
    this.reportCommand.emit('save');
  }

  copyReport(): void {
    this.reportCommand.emit('copyReport');
  }

  rerun(): void {
    this.reportCommand.emit('rerun');
  }

  onCheckpointStubStrategyChange(stubStrategyString: string): void {
    const options: string[] = [...StubStrategy.checkpoints];
    const index: number = options.indexOf(stubStrategyString);
    if (index === -1) {
      throw new Error(`ReportButtons.onCheckpointStubStrategyChange(): Unknown valu ${stubStrategyString}`);
    }
    this.checkpointStubStrategyChange.emit(StubStrategy.checkpointIndex2Stub(index));
  }

  onReportStubStrategyChange(reportStubStrategy: string): void {
    this.reportStubStrategyChange.emit(reportStubStrategy);
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
