import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistSmallCardComponent } from './artist-small-card.component';

describe('ArtistSmallCardComponent', () => {
  let component: ArtistSmallCardComponent;
  let fixture: ComponentFixture<ArtistSmallCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtistSmallCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistSmallCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
