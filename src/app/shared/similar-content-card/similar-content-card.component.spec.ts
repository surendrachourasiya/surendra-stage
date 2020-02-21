import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarContentCardComponent } from './similar-content-card.component';

describe('SimilarContentCardComponent', () => {
  let component: SimilarContentCardComponent;
  let fixture: ComponentFixture<SimilarContentCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimilarContentCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimilarContentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
