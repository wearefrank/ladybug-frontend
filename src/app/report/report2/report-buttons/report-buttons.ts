import { Component, inject, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

export interface ReportButtonStatus {
  isReportReadOnly: boolean;
  closeAllowed: boolean;
  saveAllowed: boolean;
  makeNullAllowed: boolean;
  copyReportAllowed: boolean;
}

export type ButtonCommand = 'close' | 'makeNull' | 'save' | 'copyReport';

@Component({
  selector: 'app-report-buttons',
  imports: [],
  templateUrl: './report-buttons.html',
  styleUrl: './report-buttons.css',
})
export class ReportButtons implements OnInit, OnDestroy {
  reportCommand = output<ButtonCommand>();
  @Input({ required: true }) allowed$!: Observable<ReportButtonStatus>;

  protected allowed: ReportButtonStatus = {
    isReportReadOnly: true,
    closeAllowed: true,
    makeNullAllowed: false,
    saveAllowed: false,
    copyReportAllowed: false,
  };

  private ngZone = inject(NgZone);
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.allowed$.subscribe(this.updateAllowed.bind(this)));
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

  protected getReadOnly(): string {
    return this.allowed.isReportReadOnly ? ' (read only)' : '';
  }

  private updateAllowed(allowed: ReportButtonStatus): void {
    this.ngZone.run(() => {
      this.allowed = allowed;
    });
  }
}
