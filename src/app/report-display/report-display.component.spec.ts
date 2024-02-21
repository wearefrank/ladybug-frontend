import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDisplayComponent } from './report-display.component';

describe('ReportDisplayComponent', () => {
  let component: ReportDisplayComponent;
  let fixture: ComponentFixture<ReportDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
