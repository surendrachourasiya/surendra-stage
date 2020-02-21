import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsumptionSettingsComponent } from './consumption-settings.component';

describe('ConsumptionSettingsComponent', () => {
  let component: ConsumptionSettingsComponent;
  let fixture: ComponentFixture<ConsumptionSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConsumptionSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumptionSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
