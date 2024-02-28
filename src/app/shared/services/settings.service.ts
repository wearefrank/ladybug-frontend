import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {
    this.loadSettingsFromLocalStorage();
  }

  private loadSettingsFromLocalStorage(): void {
    this.setShowMultipleAtATime(localStorage.getItem(this.showMultipleAtATimeKey) === 'true');
    const MAX_ALLOWED_DROPDOWN_VALUE: number = 8;
    const tempTableSpacing: number = +(localStorage.getItem(this.tableSpacingKey) ?? 1);
    const cappedTableSpacing: number =
      tempTableSpacing < MAX_ALLOWED_DROPDOWN_VALUE ? tempTableSpacing : MAX_ALLOWED_DROPDOWN_VALUE;
    this.setTableSpacing(cappedTableSpacing);
    this.setShowSearchWindowOnLoad(localStorage.getItem(this.showSearchWindowOnLoadKey) === 'true');
    this.setPrettifyOnLoad(localStorage.getItem(this.prettifyOnLoadKey) === 'true');
    this.setTimeoutTimeForInProgressReport(Number(localStorage.getItem(this.timeoutTimeInProgressReportKey)) ?? 1);
  }

  //Show multiple files in debug tree
  private showMultipleAtATimeKey: string = 'showMultipleFilesAtATime';
  private showMultipleAtATime: boolean = false;
  private showMultipleAtATimeSubject: Subject<boolean> = new ReplaySubject(1);
  public showMultipleAtATimeObservable: Observable<boolean> = this.showMultipleAtATimeSubject.asObservable();

  public setShowMultipleAtATime(value: boolean = false): void {
    this.showMultipleAtATime = value;
    this.showMultipleAtATimeSubject.next(this.showMultipleAtATime);
    localStorage.setItem(this.showMultipleAtATimeKey, String(this.showMultipleAtATime));
  }

  //Table spacing settings
  private tableSpacingKey: string = 'tableSpacing';
  private tableSpacing: number = 1;
  private tableSpacingSubject: Subject<number> = new ReplaySubject(1);
  public tableSpacingObservable: Observable<number> = this.tableSpacingSubject.asObservable();

  public setTableSpacing(value: number = 1): void {
    this.tableSpacing = value;
    this.tableSpacingSubject.next(value);
    localStorage.setItem(this.tableSpacingKey, String(value));
  }

  //Editor settings
  private showSearchWindowOnLoadKey: string = 'showSearchWindowOnLoad';
  private showSearchWindowOnLoad: boolean = true;
  private showSearchWindowOnLoadSubject: Subject<boolean> = new ReplaySubject(1);
  public showSearchWindowOnLoadObservable: Observable<boolean> = this.showSearchWindowOnLoadSubject.asObservable();

  public setShowSearchWindowOnLoad(value: boolean): void {
    this.showSearchWindowOnLoad = value;
    this.showSearchWindowOnLoadSubject.next(this.showSearchWindowOnLoad);
    localStorage.setItem(this.showSearchWindowOnLoadKey, String(this.showSearchWindowOnLoad));
  }

  private prettifyOnLoadKey: string = 'prettifyOnLoad';
  private prettifyOnLoad: boolean = true;
  private prettifyOnLoadSubject: Subject<boolean> = new ReplaySubject(1);
  public prettifyOnLoadObservable: Observable<boolean> = this.prettifyOnLoadSubject.asObservable();

  public setPrettifyOnLoad(value: boolean): void {
    this.prettifyOnLoad = value;
    this.prettifyOnLoadSubject.next(value);
    localStorage.setItem(this.prettifyOnLoadKey, String(this.prettifyOnLoad));
  }

  private timeoutTimeInProgressReportKey: string = 'timeoutTimeInProgressReport';
  private timeoutTimeInProgressReport: number = 30_000;
  private timeoutTimeInProgressReportSubject: Subject<number> = new ReplaySubject(1);
  public timeoutTimeInProgressReportObservable: Observable<number> =
    this.timeoutTimeInProgressReportSubject.asObservable();

  public setTimeoutTimeForInProgressReport(value: number = 30_000): void {
    this.timeoutTimeInProgressReport = value;
    this.timeoutTimeInProgressReportSubject.next(value);
    localStorage.setItem(this.timeoutTimeInProgressReportKey, String(value));
  }
}
