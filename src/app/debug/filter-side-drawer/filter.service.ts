import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private showFilterSubject: Subject<boolean> = new Subject();
  private metadataLabelsSubject: Subject<string[]> = new Subject();
  private filterContextSubject: Subject<Map<string, string>> = new Subject();
  private currentRecordsSubject: Subject<Map<string, Array<string>>> = new Subject();
  private metadataTypesSubject: Subject<Map<string, string>> = new Subject();
  private filterErrorSubject: Subject<[boolean, Map<string, string>]> = new Subject();
  private filters: Map<string, string> = new Map<string, string>();
  private filterErrors: Map<string, string> = new Map<string, string>();
  private metadataTypes: Map<string, string> = new Map<string, string>();

  showFilter$: Observable<boolean> = this.showFilterSubject.asObservable();
  metadataLabels$: Observable<string[]> = this.metadataLabelsSubject.asObservable();
  currentRecords$: Observable<Map<string, Array<string>>> = this.currentRecordsSubject.asObservable();
  metadataTypes$: Observable<Map<string, string>> = this.metadataTypesSubject.asObservable();
  filterError$: Observable<[boolean, Map<string, string>]> = this.filterErrorSubject.asObservable();

  setShowFilter(show: boolean): void {
    this.showFilterSubject.next(show);
  }

  setMetadataLabels(metadataLabels: string[]): void {
    this.metadataLabelsSubject.next(metadataLabels);
  }

  updateFilterContext(filterName: string, filterContext: string): void {
    if (filterContext.length > 0) this.filters.set(filterName, filterContext);
    else this.filters.delete(filterName);
    this.filterContextSubject.next(this.filters);
  }

  getCurrentFilterContext(): Map<string, string> {
    return this.filters;
  }

  resetFilter(): void {
    this.filters = new Map<string, string>();
    this.filterContextSubject.next(this.filters);
  }

  setCurrentRecords(records: Map<string, Array<string>>): void {
    this.currentRecordsSubject.next(records);
  }

  setMetadataTypes(metadataTypes: Map<string, string>): void {
    this.metadataTypes = metadataTypes;
    this.metadataTypesSubject.next(this.metadataTypes);
  }

  disableFilterError(): void {
    this.filterErrorSubject.next([false, new Map<string, string>()]);
  }

  enableFilterError(inputFilter: Map<string, string>) {
    this.filterErrors = inputFilter;
    this.filterErrorSubject.next([true, this.filterErrors]);
  }

  filterValidator(metadataName: string, userInput: string): boolean {
    if (this.metadataTypes.get(metadataName) == 'timestamp' && Number.isNaN(Date.parse(userInput))) {
      this.filterErrors.set(<string>this.metadataTypes.get(metadataName), userInput);
      this.enableFilterError(this.filterErrors);
      return false;
    }
    if (
      (this.metadataTypes.get(<string>this.metadataTypes.get(metadataName)) == 'int' ||
        this.metadataTypes.get(metadataName) == 'long') &&
      Number.isNaN(Number.parseFloat(userInput))
    ) {
      this.filterErrors.set(<string>this.metadataTypes.get(metadataName), userInput);
      this.enableFilterError(this.filterErrors);
      return false;
    }

    this.disableFilterError();
    return true;
  }
}
