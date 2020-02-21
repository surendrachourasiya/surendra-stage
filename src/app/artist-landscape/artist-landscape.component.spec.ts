import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistLandscapeComponent } from './artist-landscape.component';

describe('ArtistLandscapeComponent', () => {
  let component: ArtistLandscapeComponent;
  let fixture: ComponentFixture<ArtistLandscapeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtistLandscapeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistLandscapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
