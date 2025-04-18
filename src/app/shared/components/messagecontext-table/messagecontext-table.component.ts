import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CopyTooltipDirective } from '../../directives/copy-tooltip.directive';
import { Report } from '../../interfaces/report';
import { Checkpoint } from '../../interfaces/checkpoint';
import { ReportUtil } from '../../util/report-util';

@Component({
  selector: 'app-messagecontext-table',
  templateUrl: './messagecontext-table.component.html',
  styleUrls: ['./../metadata-table/metadata-table.component.css'],
  standalone: true,
  imports: [ClipboardModule, MatTooltipModule, CopyTooltipDirective, CommonModule],
})
export class MessagecontextTableComponent implements OnInit, OnChanges {
  @Input({ required: true }) report!: Report | Checkpoint;
  messageContextData: [string, string][] = [];
  protected readonly ReportUtil = ReportUtil;

  ngOnInit(): void {
    this.updateMessageContextData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.report) {
      this.updateMessageContextData();
    }
  }

  private updateMessageContextData(): void {
    const messageContext = ReportUtil.isCheckPoint(this.report) ? this.report.messageContext : null;
    this.messageContextData = messageContext ? Object.entries(messageContext) : [];
  }
}
