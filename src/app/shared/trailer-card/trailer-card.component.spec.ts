import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrailerCardComponent } from './trailer-card.component';

describe('TrailerCardComponent', () => {
  let component: TrailerCardComponent;
  let fixture: ComponentFixture<TrailerCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrailerCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrailerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
