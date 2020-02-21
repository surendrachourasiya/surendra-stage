import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullConsumptionComponent } from './full-consumption.component';

describe('FullConsumptionComponent', () => {
  let component: FullConsumptionComponent;
  let fixture: ComponentFixture<FullConsumptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullConsumptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
