import { Injectable } from '@angular/core';
import { TestListItem } from '../shared/interfaces/test-list-item';
import { HttpService } from '../shared/services/http.service';
import { catchError, Observable, ReplaySubject, Subject } from 'rxjs';
import { ErrorHandling } from '../shared/classes/error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class TestReportsService {
  metadataNames: string[] = ['storageId', 'name', 'path', 'description', 'variables'];
  storageName: string = 'Test';
  private testReportsSubject: Subject<TestListItem[]> = new ReplaySubject<TestListItem[]>(1);
  testReports$: Observable<TestListItem[]> = this.testReportsSubject.asObservable();

  constructor(
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
  ) {
    this.getReports();
  }

  getReports() {
    this.httpService
      .getTestReports(this.metadataNames, this.storageName)
      .pipe(catchError(this.errorHandler.handleError()))
      .subscribe({
        next: (response: TestListItem[]) => {
          this.testReportsSubject.next(this.sortByName(response));
        },
      });
  }

  sortByName(reports: TestListItem[]): TestListItem[] {
    return reports.sort((a: TestListItem, b: TestListItem): number =>
      a.name > b.name ? 1 : a.name === b.name ? 0 : -1,
    );
  }
}
