import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReportOrCheckpoint, ReportUtil } from '../../../shared/util/report-util';
import { ToastService } from '../../../shared/services/toast.service';
import { CustomEditorComponent } from '../../../custom-editor/custom-editor.component';

@Component({
  selector: 'app-encoding-button',
  standalone: true,
  imports: [],
  templateUrl: './encoding-button.component.html',
  styleUrl: './encoding-button.component.css',
})
export class EncodingButtonComponent implements OnChanges {
  @Input({ required: true }) selectedNode!: ReportOrCheckpoint;
  @Input({ required: true }) editor!: CustomEditorComponent;
  buttonType: string = 'Base64';
  buttonTitle: string = `Convert to ${this.buttonType}`;
  showEncodingButton: boolean = false;

  constructor(private toastService: ToastService) {}

  ngOnChanges(changes: SimpleChanges) {
    this.showEncodingButton = ReportUtil.isCheckPoint(this.selectedNode) && this.selectedNode.encoding === 'Base64';
  }

  changeEncoding(): void {
    const node: ReportOrCheckpoint = this.selectedNode;
    if (!node || !ReportUtil.isCheckPoint(node)) {
      this.toastService.showDanger('Could not find report to change encoding');
      return;
    }

    let message: string;

    if (this.buttonType == 'Base64') {
      message = node.message;
      this.updateButton(true);
    } else {
      message = btoa(node.message);
      this.buttonTitle = 'Convert to Base64';
      this.updateButton(false);
    }
    this.editor.setNewReport(message);
  }

  updateButton(isConverted: boolean): void {
    this.buttonType = isConverted ? 'utf8' : 'Base64';
    this.buttonTitle = `Convert to ${this.buttonType}`;
  }
}
