import { Injectable } from '@angular/core';
import { Report } from '../interfaces/report';
import { CreateTreeItem } from 'ng-simple-file-tree';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  download(queryString: string, storage: string, exportBinary: boolean, exportXML: boolean): void {
    window.open(
      'api/report/download/' + storage + '/' + exportBinary + '/' + exportXML + '?' + queryString.slice(0, -1),
    );
  }

  convertMessage(report: any): string {
    let message: string = report.message === null ? '' : report.message;
    if (report.encoding == 'Base64') {
      report.showConverted = true;
      message = btoa(message);
    }

    return message;
  }

  changeEncoding(report: any, button: any): string {
    let message: string;
    if (button.target.innerHTML.includes('Base64')) {
      message = report.message;
      this.setButtonHtml(report, button, 'utf8', false);
    } else {
      message = btoa(report.message);
      this.setButtonHtml(report, button, 'Base64', true);
    }

    return message;
  }

  setButtonHtml(report: any, button: any, type: string, showConverted: boolean): void {
    report.showConverted = showConverted;
    button.target.title = `Convert to ${type}`;
    button.target.innerHTML = type;
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
