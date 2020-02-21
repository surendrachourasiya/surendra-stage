import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExclusiveCardComponent } from './exclusive-card.component';

describe('ExclusiveCardComponent', () => {
  let component: ExclusiveCardComponent;
  let fixture: ComponentFixture<ExclusiveCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExclusiveCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExclusiveCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
