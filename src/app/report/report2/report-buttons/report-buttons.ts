import { Component, inject, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { StubStrategy } from '../../../shared/enums/stub-strategy';
import { FormsModule } from '@angular/forms';

export interface ReportButtonStatus {
  isReport: boolean;
  isCheckpoint: boolean;
  saveAllowed: boolean;
  isReadOnly: boolean;
}

export type ButtonCommand = 'close' | 'makeNull' | 'save' | 'copyReport';

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
  @Input({ required: true }) allowed$!: Observable<ReportButtonStatus>;
  @Input() originalCheckpointStubStrategy$?: Observable<number | undefined>;
  @Input({ required: true }) originalReportStubStrategy$!: Observable<string | undefined>;

  protected allowed: ReportButtonStatus = {
    isReport: false,
    isCheckpoint: false,
    saveAllowed: false,
    isReadOnly: true,
  };

  protected readonly StubStrategy = StubStrategy;
  protected currentCheckpointStubStrategy?: number;
  protected currentReportStubStrategy?: string;
  private ngZone = inject(NgZone);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.allowed$.subscribe(this.updateAllowed.bind(this)));
    this.subscriptions.add(
      this.originalCheckpointStubStrategy$?.subscribe((checkpointStubStrategy) => {
        if (checkpointStubStrategy !== undefined) {
          this.currentCheckpointStubStrategy = checkpointStubStrategy;
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

  onCheckpointStubStrategyChange(stubStrategy: number): void {
    this.checkpointStubStrategyChange.emit(stubStrategy);
  }

  onReportStubStrategyChange(reportStubStrategy: string): void {
    this.reportStubStrategyChange.emit(reportStubStrategy);
  }

  protected getReadOnly(): string {
    return this.allowed.isReadOnly ? ' (read only)' : '';
  }

  private updateAllowed(allowed: ReportButtonStatus): void {
    this.ngZone.run(() => {
      this.allowed = allowed;
    });
  }
}
