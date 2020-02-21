import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickViewCardComponent } from './quick-view-card.component';

describe('QuickViewCardComponent', () => {
  let component: QuickViewCardComponent;
  let fixture: ComponentFixture<QuickViewCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuickViewCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickViewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
