import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedConsumptionComponent } from './feed-consumption.component';

describe('FeedConsumptionComponent', () => {
  let component: FeedConsumptionComponent;
  let fixture: ComponentFixture<FeedConsumptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedConsumptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedConsumptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
