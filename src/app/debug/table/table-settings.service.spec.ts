import { TestBed } from '@angular/core/testing';

import { TableSettingsService } from './table-settings.service';

describe('TableSettingsService', () => {
  let service: TableSettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TableSettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
