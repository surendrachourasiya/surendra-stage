import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArtistQuickViewComponent } from './artist-quick-view.component';

describe('ArtistQuickViewComponent', () => {
  let component: ArtistQuickViewComponent;
  let fixture: ComponentFixture<ArtistQuickViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArtistQuickViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArtistQuickViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
