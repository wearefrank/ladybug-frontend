import { Component, Input } from '@angular/core';
import { DictionaryPipe } from '../../shared/pipes/dictionary.pipe';
import { NgClass, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-active-filters',
  templateUrl: './active-filters.component.html',
  styleUrls: ['./active-filters.component.css'],
  standalone: true,
  imports: [NgClass, TitleCasePipe, DictionaryPipe],
})
export class ActiveFiltersComponent {
  @Input() activeFilters?: Map<string, string>;

  constructor() {}
}
