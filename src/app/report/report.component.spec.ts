import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportComponent, ReportData } from './report.component';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportComponent, jqxTreeComponent],
      providers: [ReportData],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
