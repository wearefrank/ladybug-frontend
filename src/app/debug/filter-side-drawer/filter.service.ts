import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private showFilterSubject: Subject<boolean> = new Subject();
  showFilterObserver: Observable<boolean> = this.showFilterSubject.asObservable();

  private metadataNamesSubject: Subject<string[]> = new Subject();
  metadataNamesObserver: Observable<string[]> = this.metadataNamesSubject.asObservable();

  constructor() {}

  setShowFilter(show: boolean): void {
    this.showFilterSubject.next(show);
  }
}
