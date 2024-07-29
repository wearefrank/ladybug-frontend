import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DebugTabService {
  private refreshSubject: Subject<void> = new Subject();
  refresh$: Observable<void> = this.refreshSubject.asObservable();

  refresh(): void {
    this.refreshSubject.next();
  }
}
