import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { RefreshCondition } from '../shared/interfaces/refresh-condition';

@Injectable({
  providedIn: 'root',
})
export class DebugTabService {
  private refreshAllSubject: Subject<RefreshCondition> = new Subject();
  private refreshTableSubject: Subject<RefreshCondition> = new Subject();
  private refreshTreeSubject: Subject<RefreshCondition> = new Subject();

  refreshAll$: Observable<RefreshCondition> = this.refreshAllSubject.asObservable();
  refreshTable$: Observable<RefreshCondition> = this.refreshTableSubject.asObservable();
  refreshTree$: Observable<RefreshCondition> = this.refreshTreeSubject.asObservable();

  // triggers a refresh that refreshes both the debug table and the debug tree
  refreshAll(condition: RefreshCondition): void {
    this.refreshAllSubject.next(condition);
  }

  // triggers a refresh that refreshes only the debug table
  refreshTable(condition?: RefreshCondition): void {
    this.refreshTableSubject.next(condition ?? ({} as RefreshCondition));
  }

  //triggers a refresh that refreshes only the debug tree and the reports in the debug tree where the reportId is present in the argument
  refreshTree(condition: RefreshCondition): void {
    this.refreshTreeSubject.next(condition);
  }
}
