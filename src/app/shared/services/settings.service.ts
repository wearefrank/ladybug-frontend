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
    const tempTableSpacing = localStorage.getItem(this.tableSpacingKey);
    //check if value is not greater than max allowed value to be set from dropdown
    this.setTableSpacing(
      tempTableSpacing == undefined ? 1 : Number(tempTableSpacing) <= 8 ? Number(tempTableSpacing) : 8
    );
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
}
