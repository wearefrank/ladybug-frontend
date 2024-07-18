import { Component, Input, OnChanges } from '@angular/core';
import { CheckpointTypePipe } from '../../pipes/checkpoint-type.pipe';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { CopyTooltipDirective } from '../../directives/copy-tooltip.directive';

@Component({
  selector: 'app-display-table',
  templateUrl: './display-table.component.html',
  styleUrls: ['./display-table.component.css'],
  standalone: true,
  imports: [ClipboardModule, CheckpointTypePipe, MatTooltipModule, CopyTooltipDirective],
})
export class DisplayTableComponent implements OnChanges {
  @Input() report!: any;
  anyMessagesPresent: boolean = false;

  ngOnChanges(): void {
    this.checkIfAnyMessagesPresent();
  }

  checkIfAnyMessagesPresent(): void {
    this.anyMessagesPresent = !!(
      !this.report.xml &&
      (this.report.noCloseReceivedForStream ||
        this.report.streaming ||
        this.report.stubbed ||
        !this.report.message ||
        this.report.encoding ||
        (this.report.preTruncatedMessage && this.report.preTruncatedMessageLength.length > 0) ||
        this.report.stubNotFound)
    );
  }

  toggleToolTip(toolTip: MatTooltip): void {
    toolTip.show();
    setTimeout(() => toolTip.hide(), 2500);
  }
}
