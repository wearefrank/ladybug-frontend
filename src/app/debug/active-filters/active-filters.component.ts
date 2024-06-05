import { Component, Input } from '@angular/core';
import { DictionaryPipe } from '../../shared/pipes/dictionary.pipe';
import { NgIf, NgFor, NgClass, TitleCasePipe, KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.css'],
  standalone: true,
  imports: [NgIf, NgFor, NgClass, TitleCasePipe, DictionaryPipe, KeyValuePipe],
})
export class ActiveFiltersComponent {
  @Input() activeFilters?: Record<string, string>;

  constructor() {}
}
