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
  protected readonly ReportUtil = ReportUtil;

  @Input({ required: true }) report!: Report | Checkpoint;
  messageContextData: [string, string][] = [];

  ngOnInit() {
    this.updateMessageContextData();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.report) {
      this.updateMessageContextData();
    }
  }

  private updateMessageContextData() {
    if (ReportUtil.isCheckPoint(this.report)) {
      const messageContext = this.report.messageContext;
      if (messageContext) {
        this.messageContextData = Object.entries(messageContext);
      } else {
        this.messageContextData = [];
      }
    } else {
      this.messageContextData = [];
    }
  }
}