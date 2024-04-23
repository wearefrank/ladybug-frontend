import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private showFilterSubject: Subject<boolean> = new Subject();
  private metadataNamesSubject: Subject<string[]> = new Subject();
  private filterContextSubject: Subject<Record<string, string>> = new Subject();
  private filters: Record<string, string> = {};

  showFilter$: Observable<boolean> = this.showFilterSubject.asObservable();
  metadataNames$: Observable<string[]> = this.metadataNamesSubject.asObservable();
  filterContext$: Observable<Record<string, string>> = this.filterContextSubject.asObservable();

  setShowFilter(show: boolean): void {
    this.showFilterSubject.next(show);
  }

  setMetadataNames(metadataNames: string[]): void {
    this.metadataNamesSubject.next(metadataNames);
  }

  updateFilterContext(filterName: string, filterContext: string): void {
    if (filterContext.length > 0) this.filters[filterName] = filterContext;
    else delete this.filters[filterName];
    this.filterContextSubject.next(this.filters);
  }

  resetFilter(): void {
    this.filterContextSubject.next({});
  }
}
