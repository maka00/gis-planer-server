import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapControlComponent } from './map-control.component';

describe('MapControlComponent', () => {
  let component: MapControlComponent;
  let fixture: ComponentFixture<MapControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapControlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
