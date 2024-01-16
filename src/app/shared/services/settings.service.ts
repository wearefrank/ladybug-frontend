import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor() {
    this.loadSettingsFromLocalStorage();
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

  private loadSettingsFromLocalStorage(): void {
    this.setShowMultipleAtATime(localStorage.getItem(this.showMultipleAtATimeKey) === 'true');
  }
}
