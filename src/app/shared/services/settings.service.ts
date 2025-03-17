import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  //Show multiple files in debug tree
  public readonly defaultShowMultipleFilesAtATime: boolean = true;
  private showMultipleAtATimeKey: string = 'showMultipleFilesAtATime';
  private showMultipleAtATimeSubject: Subject<boolean> = new ReplaySubject(1);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public showMultipleAtATimeObservable: Observable<boolean> =
    this.showMultipleAtATimeSubject.asObservable();

  //Table spacing settings
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly defaultTableSpacing: number = 1;
  private tableSpacingKey: string = 'tableSpacing';
  private tableSpacingSubject: Subject<number> = new ReplaySubject(1);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public tableSpacingObservable: Observable<number> =
    this.tableSpacingSubject.asObservable();

  //Editor settings
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly defaultShowSearchWindowOnLoad: boolean = true;
  private showSearchWindowOnLoadKey: string = 'showSearchWindowOnLoad';
  private showSearchWindowOnLoadSubject: Subject<boolean> = new ReplaySubject(
    1,
  );
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public showSearchWindowOnLoadObservable: Observable<boolean> =
    this.showSearchWindowOnLoadSubject.asObservable();

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly defaultPrettifyOnLoad: boolean = true;
  private prettifyOnLoadKey: string = 'prettifyOnLoad';
  private prettifyOnLoadSubject: Subject<boolean> = new ReplaySubject(1);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public prettifyOnLoadObservable: Observable<boolean> =
    this.prettifyOnLoadSubject.asObservable();

  //Table settings
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public readonly defaultAmountOfRecordsInTable: number = 10;
  private amountOfRecordsInTableKey: string = 'amountOfRecordsInTable';
  private amountOfRecordsInTableSubject: Subject<number> = new ReplaySubject(1);
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public amountOfRecordsInTableObservable: Observable<number> =
    this.amountOfRecordsInTableSubject.asObservable();

  constructor() {
    this.loadSettingsFromLocalStorage();
  }

  public setShowMultipleAtATime(
    value: boolean = this.defaultShowMultipleFilesAtATime,
  ): void {
    this.showMultipleAtATimeSubject.next(value);
    localStorage.setItem(this.showMultipleAtATimeKey, String(value));
  }

  public setTableSpacing(value: number = this.defaultTableSpacing): void {
    this.tableSpacingSubject.next(value);
    localStorage.setItem(this.tableSpacingKey, String(value));
  }

  public setShowSearchWindowOnLoad(
    value: boolean = this.defaultShowSearchWindowOnLoad,
  ): void {
    this.showSearchWindowOnLoadSubject.next(value);
    localStorage.setItem(this.showSearchWindowOnLoadKey, String(value));
  }

  public setPrettifyOnLoad(value: boolean = this.defaultPrettifyOnLoad): void {
    this.prettifyOnLoadSubject.next(value);
    localStorage.setItem(this.prettifyOnLoadKey, String(value));
  }

  public setAmountOfRecordsInTable(
    value: number = this.defaultAmountOfRecordsInTable,
  ): void {
    this.amountOfRecordsInTableSubject.next(value);
    localStorage.setItem(this.amountOfRecordsInTableKey, String(value));
  }

  private loadSettingsFromLocalStorage(): void {
    this.setShowMultipleAtATime(
      localStorage.getItem(this.showMultipleAtATimeKey) === 'true',
    );
    const MAX_ALLOWED_DROPDOWN_VALUE: number = 8;
    const tempTableSpacing: number = +(
      localStorage.getItem(this.tableSpacingKey) ?? 1
    );
    const cappedTableSpacing: number = Math.min(
      tempTableSpacing,
      MAX_ALLOWED_DROPDOWN_VALUE,
    );
    this.setTableSpacing(cappedTableSpacing);
    this.setShowSearchWindowOnLoad(
      localStorage.getItem(this.showSearchWindowOnLoadKey) === 'true',
    );
    this.setPrettifyOnLoad(
      localStorage.getItem(this.prettifyOnLoadKey) === 'true',
    );
    const amountOfRecordsInTable =
      localStorage.getItem(this.amountOfRecordsInTableKey) ??
      this.defaultAmountOfRecordsInTable;
    this.setAmountOfRecordsInTable(+amountOfRecordsInTable);
  }
}
