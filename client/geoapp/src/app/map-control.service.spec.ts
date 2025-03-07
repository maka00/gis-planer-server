import { TestBed } from '@angular/core/testing';

import { MapControlService } from './map-control.service';

describe('MapControlService', () => {
  let service: MapControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
