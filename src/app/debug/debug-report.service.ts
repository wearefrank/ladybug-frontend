import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebugReportService {
  private openReportSubject: Subject<any> = new Subject();
  openReportObservable: Observable<any> = this.openReportSubject.asObservable();
  private changeViewSubject: Subject<any> = new Subject();
  changeViewObservable: Observable<any> = this.changeViewSubject.asObservable();

  constructor() {}

  changeView(view: any): void {
    this.changeViewSubject.next(view);
  }

  openReport(report: any): void {
    this.openReportSubject.next(report);
  }
}
