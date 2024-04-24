import { Component, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from './filter.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
  selector: 'app-filter-side-drawer',
  templateUrl: './filter-side-drawer.component.html',
  styleUrl: './filter-side-drawer.component.css',
  animations: [
    trigger('removeTrigger', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', animate('300ms ease-out', style({ transform: 'translateX(100%)' }))),
    ]),
  ],
})
export class FilterSideDrawerComponent implements OnDestroy, OnInit {
  protected shouldShowFilter!: boolean;
  protected metadataNames!: string[];
  protected filters: Record<string, string> = {};
  protected currentRecords: Map<string, Array<string>> = new Map<string, Array<string>>();

  shouldShowFilterSubscriber!: Subscription;
  metadataNamesSubscriber!: Subscription;
  filterSubscriber!: Subscription;
  currentRecordsSubscriber!: Subscription;

  constructor(protected filterService: FilterService) {}

  ngOnInit(): void {
    this.shouldShowFilterSubscriber = this.filterService.showFilter$.subscribe((show): void => {
      this.shouldShowFilter = show;
    });
    this.metadataNamesSubscriber = this.filterService.metadataNames$.subscribe((metadataNames: string[]): void => {
      this.metadataNames = metadataNames;
    });
    this.filterSubscriber = this.filterService.filterContext$.subscribe(
      (filterContext: Record<string, string>): void => {
        this.filters = filterContext;
      },
    );
    this.currentRecordsSubscriber = this.filterService.currentRecords$.subscribe(
      (records: Map<string, Array<string>>): void => {
        this.currentRecords = records;
      },
    );
  }

  ngOnDestroy(): void {
    this.shouldShowFilterSubscriber.unsubscribe();
    this.metadataNamesSubscriber.unsubscribe();
    this.filterSubscriber.unsubscribe();
    this.currentRecordsSubscriber.unsubscribe();
  }

  closeFilter() {
    this.filterService.setShowFilter(false);
  }

  updateFilter(filterEvent: MatAutocompleteSelectedEvent | Event, metadataName: string): void {
    if (filterEvent instanceof MatAutocompleteSelectedEvent) {
      this.filterService.updateFilterContext(metadataName, (filterEvent as MatAutocompleteSelectedEvent).option.value);
    } else if (filterEvent instanceof KeyboardEvent) {
      this.filterService.updateFilterContext(metadataName, (filterEvent.target as HTMLInputElement).value);
    }
  }
}
