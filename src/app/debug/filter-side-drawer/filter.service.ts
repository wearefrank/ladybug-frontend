import { Injectable } from '@angular/core';
import { debounceTime, filter, Observable, Subject } from 'rxjs';

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
  private metadataTypes: Map<string, string> = new Map<string, string>();
  private filterErrors: Map<string, string> = new Map<string, string>();

  showFilter$: Observable<boolean> = this.showFilterSubject.asObservable();
  metadataLabels$: Observable<string[]> = this.metadataLabelsSubject.asObservable();
  currentRecords$: Observable<Map<string, Array<string>>> = this.currentRecordsSubject.asObservable();
  metadataTypes$: Observable<Map<string, string>> = this.metadataTypesSubject.asObservable();
  filterError$: Observable<[boolean, Map<string, string>]> = this.filterErrorSubject.asObservable();
  filterContext$: Observable<Map<string, string>> = this.filterContextSubject.pipe(
    debounceTime(300),
    filter((context: Map<string, string>): boolean => {
      if (context.size === 0) {
        this.disableFilterError();
        return true;
      }
      let errorFound: boolean = false;
      this.filterErrors.clear();
      for (let [key, value] of context) {
        const metadataType: string | undefined = this.metadataTypes.get(key);
        if (
          (metadataType == 'timestamp' && !this.isValidTimestamp(value)) ||
          ((metadataType == 'int' || metadataType == 'long') && !this.isValidNumber(value))
        ) {
          this.filterErrors.set(<string>this.metadataTypes.get(key), value);
          errorFound = true;
        }
      }
      if (errorFound) {
        this.enableFilterError(this.filterErrors);
      } else {
        this.disableFilterError();
      }
      return !errorFound;
    }),
  );

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
    this.metadataTypes = new Map<string, string>(Object.entries(metadataTypes));
    this.metadataTypesSubject.next(this.metadataTypes);
  }

  disableFilterError(): void {
    this.filterErrors.clear();
    this.filterErrorSubject.next([false, this.filterErrors]);
  }

  enableFilterError(inputFilter: Map<string, string>): void {
    this.filterErrors = inputFilter;
    this.filterErrorSubject.next([true, this.filterErrors]);
  }

  isValidTimestamp(userInput: string): boolean {
    const regex: RegExp = /^(\*|[\d :\-]*\*?)+$/;
    return regex.test(userInput) && length < 20;
  }

  isValidNumber(userInput: string): boolean {
    const regex: RegExp = /^\*?-?\d*(\.\d*)?\*?$/;
    return regex.test(userInput);
  }
}
