import { Component, OnDestroy } from '@angular/core';
import { FilterService } from './filter.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

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
export class FilterSideDrawerComponent implements OnDestroy {
  protected shouldShowFilter!: boolean;
  shouldShowFilterSubscriber: Subscription;

  constructor(private filterService: FilterService) {
    this.shouldShowFilterSubscriber = filterService.showFilterObserver.subscribe((show) => {
      this.shouldShowFilter = show;
    });
  }

  ngOnDestroy(): void {
    this.shouldShowFilterSubscriber.unsubscribe();
  }

  closeFilter() {
    this.filterService.setShowFilter(false);
  }
}
