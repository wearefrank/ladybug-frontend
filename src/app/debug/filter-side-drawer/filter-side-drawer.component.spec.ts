import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterSideDrawerComponent } from './filter-side-drawer.component';

describe('FilterSideDrawerComponent', () => {
  let component: FilterSideDrawerComponent;
  let fixture: ComponentFixture<FilterSideDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterSideDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterSideDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
