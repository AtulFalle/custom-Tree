import { TestBed } from '@angular/core/testing';

import { TreeServiceService } from './tree-service.service';

describe('TreeServiceService', () => {
  let service: TreeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
