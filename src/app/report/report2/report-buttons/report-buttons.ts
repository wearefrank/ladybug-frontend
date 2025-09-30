import { Component, Input, OnDestroy, OnInit, output } from '@angular/core';
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
  @Input() allowed$!: Observable<ReportButtonStatus>;

  protected allowed: ReportButtonStatus = {
    closeAllowed: false,
    saveAllowed: true,
  };

  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(this.allowed$.subscribe((allowed) => (this.allowed = allowed)));
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
}
