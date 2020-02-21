import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistContentComponent } from './artist-content.component';

describe('ArtistContentComponent', () => {
  let component: ArtistContentComponent;
  let fixture: ComponentFixture<ArtistContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtistContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
