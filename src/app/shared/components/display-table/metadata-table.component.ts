import { Component, Input, OnChanges } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CopyTooltipDirective } from '../../directives/copy-tooltip.directive';
import { Report } from '../../interfaces/report';
import { Checkpoint } from '../../interfaces/checkpoint';
import { ReportUtil } from '../../util/report-util';

@Component({
  selector: 'app-metadata-table',
  templateUrl: './metadata-table.component.html',
  styleUrls: ['./metadata-table.component.css'],
  standalone: true,
  imports: [ClipboardModule, MatTooltipModule, CopyTooltipDirective],
})
export class MetadataTableComponent implements OnChanges {
  protected readonly ReportUtil = ReportUtil;

  @Input({ required: true }) report?: Report | Checkpoint;

  anyMessagesPresent: boolean = false;

  ngOnChanges(): void {
    this.checkIfAnyMessagesPresent();
  }

  checkIfAnyMessagesPresent(): void {
    if (ReportUtil.isCheckPoint(this.report)) {
      this.anyMessagesPresent = !!(
        this.report.streaming ||
        this.report.stubbed ||
        !this.report.message ||
        this.report.encoding ||
        (this.report.preTruncatedMessageLength && this.report.preTruncatedMessageLength > 0) ||
        this.report.stubNotFound
      );
    }
  }
}
