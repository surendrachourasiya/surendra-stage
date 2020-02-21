import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StageOriginalCardComponent } from './stage-original-card.component';

describe('StageOriginalCardComponent', () => {
  let component: StageOriginalCardComponent;
  let fixture: ComponentFixture<StageOriginalCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StageOriginalCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StageOriginalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
