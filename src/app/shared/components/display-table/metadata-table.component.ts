import { Component, Input, OnChanges } from '@angular/core';
import { CheckpointTypePipe } from '../../pipes/checkpoint-type.pipe';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CopyTooltipDirective } from '../../directives/copy-tooltip.directive';

@Component({
  selector: 'app-display-table',
  templateUrl: './metadata-table.component.html',
  styleUrls: ['./metadata-table.component.css'],
  standalone: true,
  imports: [ClipboardModule, CheckpointTypePipe, MatTooltipModule, CopyTooltipDirective],
})
export class MetadataTableComponent implements OnChanges {
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
}
