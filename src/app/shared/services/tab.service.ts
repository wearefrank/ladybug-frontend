import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { ReportData } from '../interfaces/report-data';
import { CompareData } from '../../compare/compare-data';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  private openReportInTabSubject: Subject<ReportData> = new ReplaySubject();
  openReportInTabObservable: Observable<ReportData> = this.openReportInTabSubject.asObservable();
  private openInCompareSubject: Subject<CompareData> = new ReplaySubject();
  openInCompareObservable: Observable<CompareData> = this.openInCompareSubject.asObservable();

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
}
