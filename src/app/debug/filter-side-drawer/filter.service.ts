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

  private filters: Record<string, string> = {};
  private filterContextSubject: Subject<Record<string, string>> = new Subject();
  filterContextObserver: Observable<Record<string, string>> = this.filterContextSubject.asObservable();

  setShowFilter(show: boolean): void {
    this.showFilterSubject.next(show);
  }

  setMetadataNames(metadataNames: string[]): void {
    this.metadataNamesSubject.next(metadataNames);
    for (const metadataName of metadataNames) {
      if (!(metadataName in this.filters)) this.updateFilterContext(metadataName, '');
    }
    for (const filterName in this.filters) {
      if (!metadataNames.includes(filterName)) delete this.filters[filterName];
    }
  }

  updateFilterContext(filterName: string, filterContext: string): void {
    this.filters[filterName] = filterContext;
    this.filterContextSubject.next(this.filters);
  }
}
