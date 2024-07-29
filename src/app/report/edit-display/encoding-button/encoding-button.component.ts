import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ReportUtil } from '../../../shared/util/report-util';
import { ToastService } from '../../../shared/services/toast.service';
import { Checkpoint } from '../../../shared/interfaces/checkpoint';
import { Report } from '../../../shared/interfaces/report';

@Component({
  selector: 'app-encoding-button',
  standalone: true,
  imports: [],
  templateUrl: './encoding-button.component.html',
  styleUrl: './encoding-button.component.css',
})
export class EncodingButtonComponent implements OnChanges {
  @Input({ required: true }) selectedNode?: Report | Checkpoint;
  @Output() updatedMessageEvent: EventEmitter<string> = new EventEmitter<string>();
  buttonType: string = 'Base64';
  showEncodingButton: boolean = false;

  constructor(private toastService: ToastService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.showEncodingButton = ReportUtil.isCheckPoint(this.selectedNode) && this.selectedNode.encoding === 'Base64';
  }

  changeEncoding(): void {
    const node: Report | Checkpoint | undefined = this.selectedNode;
    if (!ReportUtil.isCheckPoint(node)) {
      this.toastService.showDanger('Could not find report to change encoding');
      return;
    }
    let message: string;
    if (this.buttonType == 'Base64') {
      message = node.message;
      this.updateButton(true);
    } else {
      message = btoa(node.message);
      this.updateButton(false);
    }
    this.updatedMessageEvent.emit(message);
  }

  updateButton(isConverted: boolean): void {
    this.buttonType = isConverted ? 'utf8' : 'Base64';
  }
}
