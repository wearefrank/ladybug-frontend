import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-display-table',
  templateUrl: './display-table.component.html',
  styleUrls: ['./display-table.component.css'],
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
}
