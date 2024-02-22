import { TestBed } from '@angular/core/testing';

import { DebugReportService } from './debug-report.service';

describe('DebugReportService', () => {
  let service: DebugReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DebugReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
