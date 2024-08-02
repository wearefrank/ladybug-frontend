import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebugTabService {
  private refreshSubject: Subject<number[]> = new Subject();
  refresh$: Observable<number[]> = this.refreshSubject.asObservable();

  refresh(reportIds: number[]): void {
    this.refreshSubject.next(reportIds);
  }
}
