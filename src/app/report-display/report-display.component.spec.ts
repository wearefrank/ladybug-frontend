import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportDisplayComponent } from './report-display.component';
import { DisplayComponent } from '../debug/display/display.component';

describe('ReportDisplayComponent', () => {
  let component: ReportDisplayComponent;
  let fixture: ComponentFixture<ReportDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportDisplayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
