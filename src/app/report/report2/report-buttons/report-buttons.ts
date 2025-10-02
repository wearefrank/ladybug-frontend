import { Component, inject, Input, NgZone, OnDestroy, OnInit, output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';

export interface ReportButtonStatus {
  closeAllowed: boolean;
  saveAllowed: boolean;
}

export type ButtonCommand = 'close' | 'save';

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
    closeAllowed: false,
    saveAllowed: true,
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

  save(): void {
    this.reportCommand.emit('save');
  }

  private updateAllowed(allowed: ReportButtonStatus): void {
    this.ngZone.run(() => {
      this.allowed = allowed;
    });
  }
}
