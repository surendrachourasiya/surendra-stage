import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullSimilarContentCardComponent } from './full-similar-content-card.component';

describe('FullSimilarContentCardComponent', () => {
  let component: FullSimilarContentCardComponent;
  let fixture: ComponentFixture<FullSimilarContentCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullSimilarContentCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullSimilarContentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
