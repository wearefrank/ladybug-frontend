import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebugTabService {
  private refreshAllSubject: Subject<number[]> = new Subject();
  private refreshTableSubject: Subject<void> = new Subject();
  private refreshTreeSubject: Subject<number[]> = new Subject();

  refreshAll$: Observable<number[]> = this.refreshAllSubject.asObservable();
  refreshTable$: Observable<void> = this.refreshTableSubject.asObservable();
  refreshTree$: Observable<number[]> = this.refreshTreeSubject.asObservable();

  // triggers a refresh that refreshes both the debug table and the debug tree
  refreshAll(reportIds: number[]): void {
    this.refreshAllSubject.next(reportIds);
  }

  // triggers a refresh that refreshes only the debug table
  refreshTable(): void {
    this.refreshTableSubject.next();
  }

  //triggers a refresh that refreshes only the debug tree and the reports in the debug tree where the reportId is present in the argument
  refreshTree(reportIds: number[]): void {
    this.refreshTreeSubject.next(reportIds);
  }
}
