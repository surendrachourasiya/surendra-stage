import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeAllBtnComponent } from './see-all-btn.component';

describe('SeeAllBtnComponent', () => {
  let component: SeeAllBtnComponent;
  let fixture: ComponentFixture<SeeAllBtnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeeAllBtnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeeAllBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
