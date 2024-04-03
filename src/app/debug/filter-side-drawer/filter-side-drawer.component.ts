import { Component, OnDestroy } from '@angular/core';
import { FilterService } from './filter.service';
import { Subscriber, Subscription } from 'rxjs';

@Component({
  selector: 'app-filter-side-drawer',
  templateUrl: './filter-side-drawer.component.html',
  styleUrl: './filter-side-drawer.component.css',
})
export class FilterSideDrawerComponent implements OnDestroy {
  protected shouldShowFilter: boolean = false;
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
