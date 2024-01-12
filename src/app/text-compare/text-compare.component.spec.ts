import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextCompareComponent } from './text-compare.component';

describe('TextCompareComponent', () => {
  let component: TextCompareComponent;
  let fixture: ComponentFixture<TextCompareComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TextCompareComponent],
    });
    fixture = TestBed.createComponent(TextCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
