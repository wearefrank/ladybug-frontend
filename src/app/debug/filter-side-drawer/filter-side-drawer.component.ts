import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from './filter.service';
import { Subscription, catchError } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { View } from '../../shared/interfaces/view';
import { Report } from '../../shared/interfaces/report';
import { HttpService } from '../../shared/services/http.service';
import { ErrorHandling } from 'src/app/shared/classes/error-handling.service';

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
  @Input({ required: true }) currentView!: View;

  protected shouldShowFilter!: boolean;
  protected metadataLabels!: string[];
  protected currentRecords: Map<string, Array<string>> = new Map<string, Array<string>>();
  protected metadataTypes!: Map<string, string>;
  protected toolTipSuggestions?: Report;

  private genaralFilterSubscription?: Subscription;

  constructor(
    protected filterService: FilterService,
    private httpService: HttpService,
    private errorHandler: ErrorHandling,
  ) {}

  ngOnInit(): void {
    this.setSubscriptions();
    this.getFilterToolTips();
  }

  ngOnDestroy(): void {
    this.genaralFilterSubscription?.unsubscribe();
  }

  setSubscriptions(): void {
    this.genaralFilterSubscription?.add(() => {
      this.filterService.showFilter$.subscribe({
        next: (show: boolean) => (this.shouldShowFilter = show),
        error: () => catchError(this.errorHandler.handleError()),
      });
    });
    this.genaralFilterSubscription?.add(() => {
      this.filterService.metadataLabels$.subscribe({
        next: (metadataLabels: string[]) => (this.metadataLabels = metadataLabels),
        error: () => catchError(this.errorHandler.handleError()),
      });
    });
    this.genaralFilterSubscription?.add(() => {
      this.filterService.currentRecords$.subscribe({
        next: (records: Map<string, Array<string>>) => (this.currentRecords = records),
        error: () => catchError(this.errorHandler.handleError()),
      });
    });
    this.genaralFilterSubscription?.add(() => {
      this.filterService.metadataTypes$.subscribe({
        next: (metadataTypes: Map<string, string>) => (this.metadataTypes = metadataTypes),
        error: () => catchError(this.errorHandler.handleError()),
      });
    });
  }

  getFilterToolTips(): void {
    this.httpService.getUserHelp(this.currentView.storageName, this.currentView.metadataNames).subscribe({
      next: (response: Report) => (this.toolTipSuggestions = response),
      error: () => catchError(this.errorHandler.handleError()),
    });
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

  getTooltipSuggestion(key: string) {
    if (this.toolTipSuggestions) {
      return this.toolTipSuggestions[key as keyof Report];
    }
  }
}
