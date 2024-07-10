import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSideDrawerComponent } from './filter-side-drawer.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FilterSideDrawerComponent', () => {
  let component: FilterSideDrawerComponent;
  let fixture: ComponentFixture<FilterSideDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatAutocompleteModule, FormsModule, FilterSideDrawerComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSideDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
