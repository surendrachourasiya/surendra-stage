import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullConsumptionPlaylistDrawerComponent } from './full-consumption-playlist-drawer.component';

describe('FullConsumptionPlaylistDrawerComponent', () => {
  let component: FullConsumptionPlaylistDrawerComponent;
  let fixture: ComponentFixture<FullConsumptionPlaylistDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullConsumptionPlaylistDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullConsumptionPlaylistDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
