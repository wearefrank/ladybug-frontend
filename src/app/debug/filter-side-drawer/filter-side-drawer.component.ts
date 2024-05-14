import { Component, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from './filter.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

@Component({
  standalone: true,
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
  imports: [MatAutocompleteModule, FormsModule, TitleCasePipe],
})
export class FilterSideDrawerComponent implements OnDestroy, OnInit {
  protected shouldShowFilter!: boolean;
  protected metadataLabels!: string[];
  protected currentRecords: Map<string, Array<string>> = new Map<string, Array<string>>();
  protected metadataTypes!: Map<string, string>;

  shouldShowFilterSubscriber!: Subscription;
  metadataLabelsSubscriber!: Subscription;
  currentRecordsSubscriber!: Subscription;
  metadataTypesSubscriber!: Subscription;

  constructor(protected filterService: FilterService) {}

  ngOnInit(): void {
    this.setSubscriptions();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  setSubscriptions(): void {
    this.shouldShowFilterSubscriber = this.filterService.showFilter$.subscribe((show: boolean): void => {
      this.shouldShowFilter = show;
    });
    this.metadataLabelsSubscriber = this.filterService.metadataLabels$.subscribe((metadataLabels: string[]): void => {
      this.metadataLabels = metadataLabels;
    });
    this.currentRecordsSubscriber = this.filterService.currentRecords$.subscribe(
      (records: Map<string, Array<string>>): void => {
        this.currentRecords = records;
      },
    );
    this.metadataTypesSubscriber = this.filterService.metadataTypes$.subscribe(
      (metadataTypes: Map<string, string>): void => {
        this.metadataTypes = metadataTypes;
      },
    );
  }

  unsubscribeAll(): void {
    this.shouldShowFilterSubscriber.unsubscribe();
    this.metadataLabelsSubscriber.unsubscribe();
    this.currentRecordsSubscriber.unsubscribe();
    this.metadataTypesSubscriber.unsubscribe();
  }

  closeFilter(): void {
    this.filterService.setShowFilter(false);
  }

  updateFilter(filter: string, metadataName: string): void {
    this.filterService.updateFilterContext(metadataName, filter);
  }

  removeFilter(metadataName: string): void {
    this.filterService.updateFilterContext(metadataName, '');
  }
}
