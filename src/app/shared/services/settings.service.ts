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
    this.setTableSpacing(Number(localStorage.getItem(this.tableSpacingKey)));
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
  private tableSpacing: number = 0;
  private tableSpacingSubject: Subject<number> = new ReplaySubject(1);
  public tableSpacingObservable: Observable<number> = this.tableSpacingSubject.asObservable();

  public setTableSpacing(value: number = 0): void {
    this.tableSpacing = value;
    this.tableSpacingSubject.next(value);
    localStorage.setItem(this.tableSpacingKey, String(value));
  }
}
