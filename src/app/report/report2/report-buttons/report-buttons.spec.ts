import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportButtons, ReportButtonStatus } from './report-buttons';
import { BehaviorSubject, Subject } from 'rxjs';

describe('ReportButtons', () => {
  let component: ReportButtons;
  let fixture: ComponentFixture<ReportButtons>;
  let originalReportStubStrategySubject = new Subject<string>();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportButtons],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportButtons);
    component = fixture.componentInstance;
    component.allowed$ = new BehaviorSubject<ReportButtonStatus>({
      isReport: false,
      isCheckpoint: false,
      saveAllowed: false,
      isReadOnly: true,
    });
    component.originalReportStubStrategy$ = originalReportStubStrategySubject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
