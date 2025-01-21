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
    const cappedTableSpacing: number = Math.min(tempTableSpacing, MAX_ALLOWED_DROPDOWN_VALUE);
    this.setTableSpacing(cappedTableSpacing);
    this.setShowSearchWindowOnLoad(localStorage.getItem(this.showSearchWindowOnLoadKey) === 'true');
    this.setPrettifyOnLoad(localStorage.getItem(this.prettifyOnLoadKey) === 'true');
    const amountOfRecordsInTable =
      localStorage.getItem(this.amountOfRecordsInTableKey) ?? this.defaultAmountOfRecordsInTable;
    this.setAmountOfRecordsInTable(+amountOfRecordsInTable);
  }

  //Show multiple files in debug tree
  private showMultipleAtATimeKey: string = 'showMultipleFilesAtATime';
  public readonly defaultShowMultipleFilesAtATime: boolean = true;
  private showMultipleAtATimeSubject: Subject<boolean> = new ReplaySubject(1);
  public showMultipleAtATimeObservable: Observable<boolean> = this.showMultipleAtATimeSubject.asObservable();

  public setShowMultipleAtATime(value: boolean = this.defaultShowMultipleFilesAtATime): void {
    this.showMultipleAtATimeSubject.next(value);
    localStorage.setItem(this.showMultipleAtATimeKey, String(value));
  }

  //Table spacing settings
  private tableSpacingKey: string = 'tableSpacing';
  public readonly defaultTableSpacing: number = 1;
  private tableSpacingSubject: Subject<number> = new ReplaySubject(1);
  public tableSpacingObservable: Observable<number> = this.tableSpacingSubject.asObservable();

  public setTableSpacing(value: number = this.defaultTableSpacing): void {
    this.tableSpacingSubject.next(value);
    localStorage.setItem(this.tableSpacingKey, String(value));
  }

  //Editor settings
  private showSearchWindowOnLoadKey: string = 'showSearchWindowOnLoad';
  public readonly defaultShowSearchWindowOnLoad: boolean = true;
  private showSearchWindowOnLoadSubject: Subject<boolean> = new ReplaySubject(1);
  public showSearchWindowOnLoadObservable: Observable<boolean> = this.showSearchWindowOnLoadSubject.asObservable();

  public setShowSearchWindowOnLoad(value: boolean = this.defaultShowSearchWindowOnLoad): void {
    this.showSearchWindowOnLoadSubject.next(value);
    localStorage.setItem(this.showSearchWindowOnLoadKey, String(value));
  }

  private prettifyOnLoadKey: string = 'prettifyOnLoad';
  public readonly defaultPrettifyOnLoad: boolean = true;
  private prettifyOnLoadSubject: Subject<boolean> = new ReplaySubject(1);
  public prettifyOnLoadObservable: Observable<boolean> = this.prettifyOnLoadSubject.asObservable();

  public setPrettifyOnLoad(value: boolean = this.defaultPrettifyOnLoad): void {
    this.prettifyOnLoadSubject.next(value);
    localStorage.setItem(this.prettifyOnLoadKey, String(value));
  }

  //Table settings
  private amountOfRecordsInTableKey: string = 'amountOfRecordsInTable';
  public readonly defaultAmountOfRecordsInTable: number = 10;
  private amountOfRecordsInTableSubject: Subject<number> = new ReplaySubject(1);
  public amountOfRecordsInTableObservable: Observable<number> = this.amountOfRecordsInTableSubject.asObservable();

  public setAmountOfRecordsInTable(value: number = this.defaultAmountOfRecordsInTable): void {
    this.amountOfRecordsInTableSubject.next(value);
    localStorage.setItem(this.amountOfRecordsInTableKey, String(value));
  }
}
