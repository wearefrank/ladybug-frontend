import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebugTabService {
  private refreshAllSubject: Subject<number[]> = new Subject();
  refreshAll$: Observable<number[]> = this.refreshAllSubject.asObservable();

  private refreshTableSubject: Subject<void> = new Subject();
  refreshTable$: Observable<void> = this.refreshTableSubject.asObservable();

  private refreshTreeSubject: Subject<number[]> = new Subject();
  refreshTree$: Observable<number[]> = this.refreshTreeSubject.asObservable();

  refreshAll(reportIds: number[]): void {
    this.refreshAllSubject.next(reportIds);
  }

  refreshTable(): void {
    this.refreshTableSubject.next();
  }

  refreshTree(reportIds: number[]): void {
    this.refreshTreeSubject.next(reportIds);
  }
}
