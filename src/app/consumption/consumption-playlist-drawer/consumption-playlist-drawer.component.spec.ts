import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionPlaylistDrawerComponent } from './consumption-playlist-drawer.component';

describe('ConsumptionPlaylistDrawerComponent', () => {
  let component: ConsumptionPlaylistDrawerComponent;
  let fixture: ComponentFixture<ConsumptionPlaylistDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumptionPlaylistDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionPlaylistDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
