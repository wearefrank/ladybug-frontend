import { Component, OnDestroy, OnInit } from '@angular/core';
import { FilterService } from './filter.service';
import { Subscription } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { auto } from '@popperjs/core';

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
  shouldShowFilterSubscriber!: Subscription;
  protected metadataNames!: string[];
  metadataNamesSubscriber!: Subscription;

  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    this.shouldShowFilterSubscriber = this.filterService.showFilterObserver.subscribe((show) => {
      this.shouldShowFilter = show;
    });
    this.metadataNamesSubscriber = this.filterService.metadataNamesObserver.subscribe(
      (metadataNames: string[]): void => {
        this.metadataNames = metadataNames;
      },
    );
  }

  ngOnDestroy(): void {
    this.shouldShowFilterSubscriber.unsubscribe();
    this.metadataNamesSubscriber.unsubscribe();
  }

  closeFilter() {
    this.filterService.setShowFilter(false);
  }

  protected readonly auto = auto;
}
