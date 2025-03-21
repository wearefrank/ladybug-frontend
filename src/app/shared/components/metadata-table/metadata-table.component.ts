import { Component, Input } from '@angular/core';
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
export class MetadataTableComponent {
  @Input({ required: true }) report!: Report | Checkpoint;

  protected readonly ReportUtil = ReportUtil;
}
