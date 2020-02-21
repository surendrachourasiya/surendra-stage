import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullConsumptionCardComponent } from './full-consumption-card.component';

describe('FullConsumptionCardComponent', () => {
  let component: FullConsumptionCardComponent;
  let fixture: ComponentFixture<FullConsumptionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullConsumptionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullConsumptionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
