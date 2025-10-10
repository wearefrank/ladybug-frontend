import { Component, inject, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { StubStrategy } from '../../../shared/enums/stub-strategy';
import { FormsModule } from '@angular/forms';

export interface ReportButtonStatus {
  isReportReadOnly: boolean;
  closeAllowed: boolean;
  saveAllowed: boolean;
  makeNullAllowed: boolean;
  copyReportAllowed: boolean;
  reportStubStrategyEditable: boolean;
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
  reportStubStrategyChange = output<string>();
  @Input({ required: true }) allowed$!: Observable<ReportButtonStatus>;
  @Input({ required: true }) originalReportStubStrategy$!: Observable<string | undefined>;

  protected allowed: ReportButtonStatus = {
    isReportReadOnly: true,
    closeAllowed: true,
    makeNullAllowed: false,
    saveAllowed: false,
    copyReportAllowed: false,
    reportStubStrategyEditable: false,
  };

  protected readonly StubStrategy = StubStrategy;
  protected currentReportStubStrategy?: string;
  private ngZone = inject(NgZone);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.allowed$.subscribe(this.updateAllowed.bind(this)));
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

  onReportStubStrategyChange(reportStubStrategy: string): void {
    this.reportStubStrategyChange.emit(reportStubStrategy);
  }

  protected getReadOnly(): string {
    return this.allowed.isReportReadOnly ? ' (read only)' : '';
  }

  private updateAllowed(allowed: ReportButtonStatus): void {
    this.ngZone.run(() => {
      this.allowed = allowed;
    });
  }
}
