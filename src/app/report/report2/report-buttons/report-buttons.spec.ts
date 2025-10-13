import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportButtons, ReportButtonsState } from './report-buttons';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { TestResult } from 'src/app/shared/interfaces/test-result';

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
    component.state$ = new BehaviorSubject<ReportButtonsState>({
      isReport: false,
      isCheckpoint: false,
      isEdited: false,
      saveAllowed: false,
      isReadOnly: true,
    });
    component.originalReportStubStrategy$ = originalReportStubStrategySubject;
    component.rerunResult$ = new Subject<TestResult | undefined>() as Observable<TestResult | undefined>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
