import { Injectable } from '@angular/core';
import { Report } from '../interfaces/report';

@Injectable({
  providedIn: 'root',
})
export class HelperService {
  download(queryString: string, storage: string, exportBinary: boolean, exportXML: boolean): void {
    window.open(`api/report/download/${storage}/${exportBinary}/${exportXML}?${queryString.slice(0, -1)}`);
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
  }
}
