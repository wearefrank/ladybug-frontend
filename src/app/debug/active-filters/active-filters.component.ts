import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.css'],
})
export class ActiveFiltersComponent {
  @Input() activeFilters?: Map<string, string>;

  constructor() {}
}
