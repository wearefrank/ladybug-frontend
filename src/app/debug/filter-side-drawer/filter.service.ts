import { Injectable } from '@angular/core';
import { debounceTime, filter, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private showFilterSubject: Subject<boolean> = new Subject();
  private metadataLabelsSubject: Subject<Array<string>> = new Subject();
  private filterContextSubject: Subject<Map<string, string>> = new Subject();
  private currentRecordsSubject: Subject<Map<string, string[]>> = new Subject();
  private metadataTypesSubject: Subject<Map<string, string>> = new Subject();
  private filterErrorSubject: Subject<[boolean, Map<string, string>]> = new Subject();
  private filterSidePanelVisibleSubject: Subject<boolean> = new Subject<boolean>();

  filterSidePanel$: Observable<boolean> = this.filterSidePanelVisibleSubject.asObservable();
  showFilter$: Observable<boolean> = this.showFilterSubject.asObservable();
  metadataLabels$: Observable<string[]> = this.metadataLabelsSubject.asObservable();
  currentRecords$: Observable<Map<string, string[]>> = this.currentRecordsSubject.asObservable();
  metadataTypes$: Observable<Map<string, string>> = this.metadataTypesSubject.asObservable();
  filterContext$: Observable<Map<string, string>> = this.filterContextSubject.pipe(debounceTime(300));

  private metadataLabels: string[] = [];
  private filters: Map<string, string> = new Map<string, string>();
  private metadataTypes: Map<string, string> = new Map<string, string>();

  setShowFilter(show: boolean): void {
    this.showFilterSubject.next(show);
  }

  setMetadataLabels(metadataLabels: Array<string>): void {
    //Safely transform old filter to filter with new metadata columns
    let wasChanged: boolean = false;
    for (const metadataLabel of this.metadataLabels) {
      if (!metadataLabels.includes(metadataLabel)) {
        this.filters.delete(metadataLabel);
        wasChanged = true;
      }
    }
    if (wasChanged) {
      this.filterContextSubject.next(this.filters);
    }
    this.metadataLabels = metadataLabels;
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

  toggleShowFilterSidePanel(value: boolean) {
    this.filterSidePanelVisibleSubject.next(value);
  }
}
