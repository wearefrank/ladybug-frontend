import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from './filter.service';
import { Observable, Subscription, catchError, of } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { View } from '../../shared/interfaces/view';
import { Report } from '../../shared/interfaces/report';
import { HttpService } from '../../shared/services/http.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from 'src/app/shared/services/toast.service';

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

  private shouldShowFilterSubscription?: Subscription;
  private metadataLabelsSubscription?: Subscription;
  private currentRecordsSubscription?: Subscription;
  private metadataTypesSubscription?: Subscription;

  constructor(
    protected filterService: FilterService,
    private httpService: HttpService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.setSubscriptions();
    this.getFilterToolTips();
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  handleError(): (error: HttpErrorResponse) => Observable<any> {
    return (error: HttpErrorResponse): Observable<any> => {
      const message = error.error;
      if (message && message.includes('- detailed error message -')) {
        const errorMessageParts = message.split('- detailed error message -');
        this.toastService.showDanger(errorMessageParts[0], errorMessageParts[1]);
      } else {
        this.toastService.showDanger(error.message, '');
      }
      return of(error);
    };
  }

  setSubscriptions(): void {
    this.shouldShowFilterSubscription = this.filterService.showFilter$.subscribe({
      next: (show: boolean) => (this.shouldShowFilter = show),
      error: () => catchError(this.handleError()),
    });
    this.metadataLabelsSubscription = this.filterService.metadataLabels$.subscribe({
      next: (metadataLabels: string[]) => (this.metadataLabels = metadataLabels),
      error: () => catchError(this.handleError()),
    });
    this.currentRecordsSubscription = this.filterService.currentRecords$.subscribe({
      next: (records: Map<string, Array<string>>) => (this.currentRecords = records),
      error: () => catchError(this.handleError()),
    });
    this.metadataTypesSubscription = this.filterService.metadataTypes$.subscribe({
      next: (metadataTypes: Map<string, string>) => (this.metadataTypes = metadataTypes),
      error: () => catchError(this.handleError()),
    });
  }

  unsubscribeAll(): void {
    this.shouldShowFilterSubscription?.unsubscribe();
    this.metadataLabelsSubscription?.unsubscribe();
    this.currentRecordsSubscription?.unsubscribe();
    this.metadataTypesSubscription?.unsubscribe();
  }

  getFilterToolTips(): void {
    this.httpService.getUserHelp(this.currentView.storageName, this.currentView.metadataNames).subscribe({
      next: (response: Report) => (this.toolTipSuggestions = response),
      error: () => catchError(this.handleError()),
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
