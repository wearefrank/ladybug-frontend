import { Injectable } from '@angular/core';
import { Report } from '../interfaces/report';
import { Checkpoint } from '../interfaces/checkpoint';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  download(queryString: string, storage: string, exportBinary: boolean, exportXML: boolean): void {
    window.open(`api/report/download/${storage}/${exportBinary}/${exportXML}?${queryString.slice(0, -1)}`);
  }

  convertMessage(checkpoint: Checkpoint): string {
    let message: string = checkpoint.message === null ? '' : checkpoint.message;
    if (checkpoint.encoding == 'Base64') {
      message = btoa(message);
    }
    return message;
  }

  changeEncoding(checkpoint: Checkpoint, button: MouseEvent): string {
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

  getSelectedIds(reports: any[]): number[] {
    let copiedIds: number[] = [];
    for (const report of this.getSelectedReports(reports)) {
      copiedIds.push(report.storageId);
    }
    return copiedIds;
  }

  getSelectedReports(reports: Report[]): Report[] {
    return reports.filter((report: Report) => report.checked);
  }

  createCompareTabId(originalReport: Report, runResultReport: Report): string {
    return `${originalReport.storageId}-${runResultReport.storageId}`;
  }
}
