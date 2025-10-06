import { Component, Input } from '@angular/core';

export interface CheckpointLabels {
  isEdited: boolean;
  isMessageNull: boolean;
  isMessageEmpty: boolean;
  stubbed: boolean;
  encoding: string | undefined;
  messageClassName: string | undefined;
  // TODO: Remove here and remove from checkpoint.ts.
  showConverted?: boolean;
  charactersRemoved: number;
  stubNotFound?: string;
}

@Component({
  selector: 'app-report-alert-message2',
  standalone: true,
  templateUrl: './report-alert-message2.component.html',
  styleUrl: './report-alert-message2.component.css',
})
export class ReportAlertMessage2Component {
  @Input() labels: CheckpointLabels | undefined;
}
