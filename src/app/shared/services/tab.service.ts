import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ReportData } from '../interfaces/report-data';
import { CompareData } from '../../compare/compare-data';
import { CloseTab } from '../interfaces/close-tab';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  private openReportInTabSubject: Subject<ReportData> = new ReplaySubject();
  private openInCompareSubject: Subject<CompareData> = new ReplaySubject();
  private closeTabSubject: Subject<CloseTab> = new ReplaySubject();

  openReportInTab$: Observable<ReportData> = this.openReportInTabSubject.asObservable();
  openInCompare$: Observable<CompareData> = this.openInCompareSubject.asObservable();
  closeTab$: Observable<CloseTab> = this.closeTabSubject.asObservable();

  activeReportTabs: Map<string, ReportData> = new Map();
  activeCompareTabs: Map<string, CompareData> = new Map();

  openNewTab(value: ReportData): void {
    this.activeReportTabs.set(value.report.storageId.toString(), value);
    this.openReportInTabSubject.next(value);
  }

  openNewCompareTab(value: CompareData): void {
    this.openInCompareSubject.next(value);
    this.activeCompareTabs.set(value.id, value);
  }

  closeTab(value: CompareData | ReportData): void {
    let closeTab: CloseTab;
    if (value instanceof CompareData) {
      this.activeCompareTabs.delete(value.id);
      closeTab = { id: value.id, type: 'compare' };
    } else {
      this.activeReportTabs.delete(value.report.storageId.toString());
      closeTab = { id: value.report.storageId.toString(), type: 'report' };
    }
    this.closeTabSubject.next(closeTab);
  }
}
