import { Injectable } from '@angular/core';
import { TestListItem } from '../shared/interfaces/test-list-item';
import { HttpService } from '../shared/services/http.service';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestReportsService {
  private testReportsSubject: Subject<TestListItem[]> = new ReplaySubject<TestListItem[]>(1);

  testReports$: Observable<TestListItem[]> = this.testReportsSubject.asObservable();

  metadataNames: string[] = ['storageId', 'name', 'path', 'description', 'variables'];
  storageName: string = 'Test';

  constructor(private httpService: HttpService) {
    this.getReports();
  }

  getReports(): void {
    this.httpService.getTestReports(this.metadataNames, this.storageName).subscribe({
      next: (response: TestListItem[]): void => {
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
