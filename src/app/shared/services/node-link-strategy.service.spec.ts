import { TestBed } from '@angular/core/testing';

import { ChangeNodeLinkStrategyService } from './node-link-strategy.service';

describe('ChangeNodeLinkStrategyService', () => {
  let service: ChangeNodeLinkStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChangeNodeLinkStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
