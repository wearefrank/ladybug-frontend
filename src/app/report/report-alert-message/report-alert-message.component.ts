import { Component, Input, OnChanges } from '@angular/core';
import { ReportUtil } from '../../shared/util/report-util';
import { Report } from '../../shared/interfaces/report';
import { Checkpoint } from '../../shared/interfaces/checkpoint';

@Component({
  selector: 'app-report-alert-message',
  standalone: true,
  templateUrl: './report-alert-message.component.html',
  styleUrl: './report-alert-message.component.css',
})
export class ReportAlertMessageComponent implements OnChanges {
  protected readonly ReportUtil = ReportUtil;

  protected anyAlertMessagesPresent: boolean = false;
  @Input({ required: true }) report!: Report | Checkpoint;

  ngOnChanges(): void {
    this.checkIfAnyAlertMessagesPresent();
  }

  private checkIfAnyAlertMessagesPresent(): void {
    if (ReportUtil.isCheckPoint(this.report)) {
      this.anyAlertMessagesPresent = !!(
        this.report.streaming ||
        this.report.stubbed ||
        !this.report.message ||
        this.report.encoding ||
        (this.report.preTruncatedMessageLength &&
          this.report.preTruncatedMessageLength > 0) ||
        this.report.stubNotFound
      );
    }
  }
}
