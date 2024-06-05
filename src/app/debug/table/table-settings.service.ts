import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TableSettings } from '../../shared/interfaces/table-settings';
import { ViewSettings } from '../../shared/interfaces/view-settings';

@Injectable({
  providedIn: 'root',
})
export class TableSettingsService {
  private viewSettings: ViewSettings = {
    defaultView: '',
    views: {},
    currentView: {},
    currentViewName: '',
  };
  private tableSettings: TableSettings = {
    reportMetadata: [],
    metadataHeaders: [],
    tableLoaded: false,
    displayAmount: 10,
    showFilter: false,
    filterValues: [],
    filterHeaders: [],
    numberOfReportsInProgress: 0,
    estimatedMemoryUsage: '',
    uniqueValues: new Map<string, Array<string>>(),
  };
  private tableSettingsSubject: BehaviorSubject<TableSettings> = new BehaviorSubject<TableSettings>(this.tableSettings);
  private viewSettingsSubject: BehaviorSubject<ViewSettings> = new BehaviorSubject<ViewSettings>(this.viewSettings);
  private allRowsSelectedSubject: Subject<boolean> = new Subject();
  private metadataCountSubject: Subject<number> = new Subject();
  private currentFiltersSubject: Subject<Record<string, string>> = new Subject();

  tableSettings$: Observable<TableSettings> = this.tableSettingsSubject.asObservable();
  viewSettings$: Observable<ViewSettings> = this.viewSettingsSubject.asObservable();
  allRowsSelected$: Observable<boolean> = this.allRowsSelectedSubject.asObservable();
  metadataCount$: Observable<number> = this.metadataCountSubject.asObservable();
  currentFilters$: Observable<Record<string, string>> = this.currentFiltersSubject.asObservable();

  constructor() {}

  setTableSettings(tableSettings: TableSettings): void {
    this.tableSettingsSubject.next(tableSettings);
  }

  setViewSettings(viewSettings: ViewSettings): void {
    this.viewSettingsSubject.next(viewSettings);
  }

  setAllRowsSelected(allSelected: boolean): void {
    this.allRowsSelectedSubject.next(allSelected);
  }

  setMetadataCount(count: number): void {
    this.metadataCountSubject.next(count);
  }

  setCurrentFilters(currentFilters: Record<string, string>): void {
    this.currentFiltersSubject.next(currentFilters);
  }
}
