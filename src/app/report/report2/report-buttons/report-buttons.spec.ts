import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportButtons, ReportButtonsState } from './report-buttons';
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
    component.state$ = new BehaviorSubject<ReportButtonsState>({
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
