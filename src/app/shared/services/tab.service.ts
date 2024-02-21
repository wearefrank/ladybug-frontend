import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TabService {
  private openReportInTabSubject: Subject<any> = new ReplaySubject();
  openReportInTabObservable: Observable<any> = this.openReportInTabSubject.asObservable();
  private openInCompareSubject: Subject<any> = new ReplaySubject();
  openInCompareObservable: Observable<any> = this.openInCompareSubject.asObservable();
  constructor() {}

  openNewTab(value: any): void {
    this.openReportInTabSubject.next(value);
  }

  openNewCompareTab(value: any): void {
    this.openInCompareSubject.next(value);
  }
}
