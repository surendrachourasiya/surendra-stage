import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonDropdownComponent } from './season-dropdown.component';

describe('SeasonDropdownComponent', () => {
  let component: SeasonDropdownComponent;
  let fixture: ComponentFixture<SeasonDropdownComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SeasonDropdownComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
