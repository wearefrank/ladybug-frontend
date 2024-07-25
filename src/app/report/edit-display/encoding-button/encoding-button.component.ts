import { Component, Input } from '@angular/core';
import { ReportOrCheckpoint, ReportUtil } from '../../../shared/util/report-util';
import { ToastService } from '../../../shared/services/toast.service';
import { Checkpoint } from '../../../shared/interfaces/checkpoint';
import { CustomEditorComponent } from '../../../custom-editor/custom-editor.component';

@Component({
  selector: 'app-encoding-button',
  standalone: true,
  imports: [],
  templateUrl: './encoding-button.component.html',
  styleUrl: './encoding-button.component.css',
})
export class EncodingButtonComponent {
  @Input({ required: true }) selectedNode!: ReportOrCheckpoint;
  @Input({ required: true }) editor!: CustomEditorComponent;

  constructor(private toastService: ToastService) {}

  changeEncoding(button: MouseEvent): void {
    const node: ReportOrCheckpoint = this.selectedNode;
    if (!node || !ReportUtil.isCheckPoint(node)) {
      this.toastService.showDanger('Could not find report to change encoding');
      return;
    }
    this.editor.setNewReport(this.setEncoding(node, button));
  }

  setEncoding(checkpoint: Checkpoint, button: MouseEvent): string {
    let message: string;
    const target: HTMLElement | null = button.target as HTMLElement;
    if (target && target.innerHTML.includes('Base64')) {
      message = checkpoint.message;
      this.setButtonHtml(checkpoint, button, 'utf8', false);
    } else {
      message = btoa(checkpoint.message);
      this.setButtonHtml(checkpoint, button, 'Base64', true);
    }

    return message;
  }

  setButtonHtml(checkpoint: Checkpoint, button: MouseEvent, type: string, showConverted: boolean): void {
    checkpoint.showConverted = showConverted;
    const target: HTMLElement | null = button.target as HTMLElement;
    target.title = `Convert to ${type}`;
    target.innerHTML = type;
  }

  protected readonly ReportUtil = ReportUtil;
}
