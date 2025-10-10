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
      isReportReadOnly: true,
      closeAllowed: true,
      makeNullAllowed: false,
      saveAllowed: false,
      copyReportAllowed: true,
      reportStubStrategyEditable: false,
    });
    component.originalReportStubStrategy$ = originalReportStubStrategySubject;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
