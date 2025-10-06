import { Component, Input, OnChanges } from '@angular/core';
import { ReportUtil as ReportUtility } from '../../shared/util/report-util';
import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';

@Component({
  selector: 'app-report-alert-message2',
  standalone: true,
  templateUrl: './report-alert-message2.component.html',
  styleUrl: './report-alert-message2.component.css',
})
export class ReportAlertMessage2Component implements OnChanges {
  @Input({ required: true }) report!: Report | Checkpoint;
  protected readonly ReportUtil = ReportUtility;
  protected anyAlertMessagesPresent = false;

  ngOnChanges(): void {
    this.checkIfAnyAlertMessagesPresent();
  }

  private checkIfAnyAlertMessagesPresent(): void {
    if (ReportUtility.isCheckPoint(this.report)) {
      this.anyAlertMessagesPresent = !!(
        this.report.streaming ||
        this.report.stubbed ||
        !this.report.message ||
        this.report.message === null ||
        this.report.encoding ||
        (this.report.preTruncatedMessageLength && this.report.preTruncatedMessageLength > 0) ||
        this.report.stubNotFound
      );
    }
  }
}
